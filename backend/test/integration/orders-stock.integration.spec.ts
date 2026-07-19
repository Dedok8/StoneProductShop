import { ConfigService } from '@nestjs/config';

import { CategoryFixture } from '../fixtures/category.fixture';
import { ProductFixture } from '../fixtures/product.fixture';
import { UserFixture } from '../fixtures/user.fixture';

import { OrderStatus } from '@/generated/prisma/client';
import { InsufficientStockError, OrderRepository } from '@/model';
import {
  HashService,
  PrismaService,
  RedisCacheService,
  RedisService,
} from '@/shared';

describe('Orders — atomic stock decrement (integration)', () => {
  let prisma: PrismaService;
  let redis: RedisService;
  let orderRepository: OrderRepository;
  let userFixture: UserFixture;
  let productFixture: ProductFixture;
  let categoryFixture: CategoryFixture;

  let ownerId: string;
  let categoryId: string;

  beforeAll(async () => {
    redis = new RedisService(new ConfigService());
    await redis.onModuleInit();
    const redisCache = new RedisCacheService(redis);

    prisma = new PrismaService(redisCache);
    await prisma.onModuleInit();

    orderRepository = new OrderRepository(prisma);
    userFixture = new UserFixture(prisma, new HashService());
    productFixture = new ProductFixture(prisma);
    categoryFixture = new CategoryFixture(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
    await prisma.onModuleDestroy();
    await redis.onModuleDestroy();
  });

  beforeEach(async () => {
    await prisma.onCleanDatabase();

    const owner = userFixture.create({ role: 'ADMIN' });
    ownerId = (await owner).id;

    const category = await categoryFixture.create();
    categoryId = category.id;
  });

  it('successfully creates the order and deducts the exact quantity from inventory', async () => {
    const product = await productFixture.create({
      categoryId,
      ownerId,
      stock: 10,
      price: 100,
    });

    const order = await orderRepository.create({
      userId: ownerId,
      items: [{ productId: product.id, quantity: 3 }],
    });

    expect(order.status).toBe(OrderStatus.PENDING);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(3);
    expect(order.items[0].price).toBe(100);

    const updateProduct = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(updateProduct.stock).toBe(7);
  });

  it('Throws an InsufficientStockError and does NOT create an order when there is insufficient stock', async () => {
    const product = await productFixture.create({
      categoryId,
      ownerId,
      stock: 2,
      price: 100,
    });

    await expect(
      orderRepository.create({
        userId: ownerId,
        items: [{ productId: product.id, quantity: 5 }],
      }),
    ).rejects.toBeInstanceOf(InsufficientStockError);

    const unchangedProduct = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });
    expect(unchangedProduct.stock).toBe(2);

    const orders = await prisma.order.findMany({ where: { userId: ownerId } });
    expect(orders).toHaveLength(0);
  });

  it('Reverses the stock write-off for ALL items if even one is missing', async () => {
    const productA = await productFixture.create({
      categoryId,
      ownerId,
      stock: 10,
      price: 50,
    });

    const productB = await productFixture.create({
      categoryId,
      ownerId,
      stock: 1,
      price: 30,
    });

    await expect(
      orderRepository.create({
        userId: ownerId,
        items: [
          { productId: productA.id, quantity: 5 },
          { productId: productB.id, quantity: 5 },
        ],
      }),
    ).rejects.toBeInstanceOf(InsufficientStockError);

    const unchangedA = await prisma.product.findUniqueOrThrow({
      where: { id: productA.id },
    });

    expect(unchangedA.stock).toBe(10);
  });

  it('Prevents stock from being written off below zero when there are concurrent orders for the same item', async () => {
    const product = await productFixture.create({
      categoryId,
      ownerId,
      stock: 5,
      price: 100,
    });

    const attempts = await Promise.allSettled([
      orderRepository.create({
        userId: ownerId,
        items: [{ productId: product.id, quantity: 2 }],
      }),

      orderRepository.create({
        userId: ownerId,
        items: [{ productId: product.id, quantity: 2 }],
      }),

      orderRepository.create({
        userId: ownerId,
        items: [{ productId: product.id, quantity: 2 }],
      }),
    ]);

    const fulfilled = attempts.filter((r) => r.status === 'fulfilled');
    const rejected = attempts.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBeLessThanOrEqual(2);
    expect(rejected.length).toBeGreaterThanOrEqual(1);

    const finalProduct = await prisma.product.findUniqueOrThrow({
      where: { id: product.id },
    });

    expect(finalProduct.stock).toBeGreaterThanOrEqual(0);
    expect(finalProduct.stock).toBe(5 - fulfilled.length * 2);
  });

  it('throws a NotFoundException if the product does not exist', async () => {
    await expect(
      orderRepository.create({
        userId: ownerId,
        items: [
          { productId: '00000000-0000-0000-0000-000000000000', quantity: 1 },
        ],
      }),
    ).rejects.toThrow('not found');
  });
});
