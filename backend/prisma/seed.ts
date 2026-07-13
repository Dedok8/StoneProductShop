import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import slugify from 'slugify';

import { PrismaClient } from '@/generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const toSlug = (name: string) => slugify(name, { lower: true, strict: true });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@exaple.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const categoriesData = [
    { name: 'Granite', slug: 'granite' },
    { name: 'Marble', slug: 'marble' },
    { name: 'Limestone', slug: 'limestone' },
  ];

  const categories = await Promise.all(
    categoriesData.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name },
        create: c,
      }),
    ),
  );

  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const productsData = [
    {
      name: 'Granite slab 60x60',
      slug: 'granite-slab-60x60',
      price: 15000,
      stock: 20,
      categorySlug: 'granite',
    },
    {
      name: 'Granite curb',
      slug: 'granite-curb',
      price: 3500,
      stock: 50,
      categorySlug: 'granite',
    },
    {
      name: 'Marble slab 60x60',
      slug: 'marble-slab-60x60',
      price: 22000,
      stock: 15,
      categorySlug: 'marble',
    },
    {
      name: 'Limestone tile 30x30',
      slug: 'limestone-tile-30x30',
      price: 1800,
      stock: 100,
      categorySlug: 'limestone',
    },
  ];

  for (const p of productsData) {
    const slug = toSlug(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: {
        price: p.price,
        stock: p.stock,
      },
      create: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        stock: p.stock,
        categoryId: categoryBySlug[p.categorySlug].id,
        ownerId: admin.id,
      },
    });
  }

  console.log('Seed finished.');
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
