import { ConfigService } from '@nestjs/config';

import { CategoryFixture } from '../fixtures/category.fixture';
import { ProductFixture } from '../fixtures/product.fixture';
import { UserFixture } from '../fixtures/user.fixture';

import { CartRepository, ProductNotFoundError } from '@/model/cart';
import {
  HashService,
  PrismaService,
  RedisCacheService,
  RedisService,
} from '@/shared';

describe('Cart — atomicity & concurrency (integration)', () => {
  let prisma: PrismaService;
  let redis: RedisService;
  let cartRepository: CartRepository;
  let userFixture: UserFixture;
  let productFixture: ProductFixture;
  let categoryFixture: CategoryFixture;

  let ownerId: string;
  let userId: string;
  let categoryId: string;

  beforeAll(async () => {
    redis = new RedisService(new ConfigService());
    await redis.onModuleInit();
    const redisCache = new RedisCacheService(redis);

    prisma = new PrismaService(redisCache);
    await prisma.onModuleInit();

    cartRepository = new CartRepository(prisma);
    userFixture = new UserFixture(prisma, new HashService());
    productFixture = new ProductFixture(prisma);
    categoryFixture = new CategoryFixture(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
    await redis.onModuleDestroy();
  });

  beforeEach(async () => {
    await prisma.onCleanDatabase();

    const owner = await userFixture.create({ role: 'ADMIN' });
    ownerId = owner.id;

    const user = await userFixture.create({ role: 'USER' });
    userId = user.id;

    const category = await categoryFixture.create();
    categoryId = category.id;
  });

  describe('getOrCreate', () => {
    it('creates exactly one cart for a user and returns the same one on subsequent calls', async () => {
      const first = await cartRepository.getOrCreate(userId);
      const second = await cartRepository.getOrCreate(userId);

      expect(first.id).toBe(second.id);

      const carts = await prisma.cart.findMany({ where: { userId } });
      expect(carts).toHaveLength(1);
    });

    it('never creates more than one cart when getOrCreate is called concurrently for the same user', async () => {
      const attempts = await Promise.allSettled([
        cartRepository.getOrCreate(userId),
        cartRepository.getOrCreate(userId),
        cartRepository.getOrCreate(userId),
        cartRepository.getOrCreate(userId),
        cartRepository.getOrCreate(userId),
      ]);

      const fulfilled = attempts.filter((r) => r.status === 'fulfilled');
      expect(fulfilled.length).toBeGreaterThan(0);

      const carts = await prisma.cart.findMany({ where: { userId } });
      expect(carts).toHaveLength(1);
    });
  });

  describe('addItem', () => {
    it('creates the cart and the item on first add', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId,
        stock: 10,
        price: 100,
      });

      const cart = await cartRepository.addItem(userId, product.id, 2);

      expect(cart.userId).toBe(userId);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]).toMatchObject({
        productId: product.id,
        quantity: 2,
      });
    });

    it('increments the existing quantity instead of creating a duplicate row', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId,
        stock: 10,
        price: 100,
      });

      await cartRepository.addItem(userId, product.id, 2);
      const cart = await cartRepository.addItem(userId, product.id, 3);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);

      const rows = await prisma.cartItem.findMany({
        where: { cart: { userId }, productId: product.id },
      });
      expect(rows).toHaveLength(1);
    });

    it('throws ProductNotFoundError and creates no cart/item when the product does not exist', async () => {
      await expect(
        cartRepository.addItem(
          userId,
          '00000000-0000-0000-0000-000000000000',
          1,
        ),
      ).rejects.toBeInstanceOf(ProductNotFoundError);

      const carts = await prisma.cart.findMany({ where: { userId } });
      expect(carts).toHaveLength(0);
    });

    it('does not allow items to be added to another user cart (isolation)', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId,
        stock: 10,
        price: 100,
      });

      await cartRepository.addItem(userId, product.id, 1);
      const otherUser = await userFixture.create({ role: 'USER' });
      const otherCart = await cartRepository.getOrCreate(otherUser.id);

      expect(otherCart.items).toEqual([]);
    });

    it('sums quantities correctly under concurrent additions of the same product', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId,
        stock: 100,
        price: 100,
      });

      const attempts = await Promise.allSettled([
        cartRepository.addItem(userId, product.id, 1),
        cartRepository.addItem(userId, product.id, 2),
        cartRepository.addItem(userId, product.id, 3),
        cartRepository.addItem(userId, product.id, 4),
      ]);

      const fulfilled = attempts.filter((r) => r.status === 'fulfilled');
      expect(fulfilled.length).toBe(4);

      const cart = await cartRepository.getOrCreate(userId);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(1 + 2 + 3 + 4);
    });

    it('does not let a race between two different products create two carts for one user', async () => {
      const productA = await productFixture.create({
        categoryId,
        ownerId,
        stock: 10,
        price: 100,
      });
      const productB = await productFixture.create({
        categoryId,
        ownerId,
        stock: 10,
        price: 50,
      });

      await Promise.allSettled([
        cartRepository.addItem(userId, productA.id, 1),
        cartRepository.addItem(userId, productB.id, 1),
      ]);

      const carts = await prisma.cart.findMany({ where: { userId } });
      expect(carts).toHaveLength(1);

      const cart = await cartRepository.getOrCreate(userId);
      expect(cart.items.map((i) => i.productId).sort()).toEqual(
        [productA.id, productB.id].sort(),
      );
    });
  });

  describe('setItemQuantity', () => {
    it('overwrites the quantity with the last write when called concurrently', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId,
        stock: 100,
        price: 100,
      });
      await cartRepository.addItem(userId, product.id, 1);

      const attempts = await Promise.allSettled([
        cartRepository.setItemQuantity(userId, product.id, 5),
        cartRepository.setItemQuantity(userId, product.id, 9),
      ]);

      expect(attempts.every((r) => r.status === 'fulfilled')).toBe(true);

      const cart = await cartRepository.getOrCreate(userId);
      expect(cart.items).toHaveLength(1);
      expect([5, 9]).toContain(cart.items[0].quantity);
    });

    it('removes the row entirely when the quantity is set to zero or below', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId,
        stock: 10,
        price: 100,
      });
      await cartRepository.addItem(userId, product.id, 3);

      const cart = await cartRepository.setItemQuantity(userId, product.id, 0);

      expect(cart.items).toEqual([]);

      const rows = await prisma.cartItem.findMany({
        where: { cart: { userId }, productId: product.id },
      });
      expect(rows).toHaveLength(0);
    });
  });

  describe('removeItem', () => {
    it('removes only the targeted product, leaving the rest of the cart untouched', async () => {
      const productA = await productFixture.create({
        categoryId,
        ownerId,
        stock: 10,
        price: 100,
      });
      const productB = await productFixture.create({
        categoryId,
        ownerId,
        stock: 10,
        price: 50,
      });

      await cartRepository.addItem(userId, productA.id, 1);
      await cartRepository.addItem(userId, productB.id, 2);

      const cart = await cartRepository.removeItem(userId, productA.id);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(productB.id);
    });

    it('is idempotent — removing an item that is not present does not throw', async () => {
      await cartRepository.getOrCreate(userId);

      await expect(
        cartRepository.removeItem(
          userId,
          '00000000-0000-0000-0000-000000000000',
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('removes every item but keeps the cart row itself', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId,
        stock: 10,
        price: 100,
      });
      await cartRepository.addItem(userId, product.id, 2);

      await cartRepository.clear(userId);

      const cart = await cartRepository.getOrCreate(userId);
      expect(cart.items).toEqual([]);

      const carts = await prisma.cart.findMany({ where: { userId } });
      expect(carts).toHaveLength(1);
    });

    it('does nothing (no error) when the user has no cart yet', async () => {
      await expect(cartRepository.clear(userId)).resolves.not.toThrow();

      const carts = await prisma.cart.findMany({ where: { userId } });
      expect(carts).toHaveLength(0);
    });
  });
});
