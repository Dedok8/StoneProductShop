import { execSync } from 'child_process';

import {
  disconnectTestDatabase,
  testPrismaClient as prisma,
} from '../utils/test-db.setup';

beforeAll(() => {
  execSync('npx prisma db seed', { stdio: 'inherit' });
});

afterAll(async () => {
  await disconnectTestDatabase();
});

describe('Database seed', () => {
  it('must create users', async () => {
    const users = await prisma.user.findMany();
    expect(users.length).toBeGreaterThan(0);
  });

  it('must create a specific record with the expected fields', async () => {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });
    expect(admin).not.toBeNull();
    expect(admin?.role).toBe('ADMIN');
  });

  it('must create categories and products', async () => {
    const categories = await prisma.category.findMany();
    expect(categories.length).toBeGreaterThan(0);

    const products = await prisma.product.findMany();
    expect(products.length).toBeGreaterThan(0);
  });

  it('relations must be correctly configured', async () => {
    const product = await prisma.product.findFirst({
      include: { category: true, owner: true },
    });

    expect(product?.category).toBeDefined();
    expect(product?.owner).toBeDefined();
    expect(product?.owner.email).toBe('admin@example.com');
  });
});
