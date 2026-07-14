import { randomUUID } from 'node:crypto';

import type { CreateProductDto } from '@/model';
import type { PrismaService } from '@/shared';

export interface ValidProductDto extends CreateProductDto {
  id: string;
  categoryId: string;
  ownerId: string;
}

const SLUG_PREFIX = 'granite-slab-premium-';

export const createValidProductDto = (
  overrides: Partial<ValidProductDto> &
    Pick<ValidProductDto, 'categoryId' | 'ownerId'>,
): ValidProductDto => {
  const uniqueId = Math.floor(Math.random() * 100000);

  return {
    id: randomUUID(),
    name: `Granite Slab Premium ${uniqueId}`,
    slug: `${SLUG_PREFIX}${uniqueId}`,
    description: 'High-quality natural stone slab',
    price: 15000,
    stock: 10,
    images: ['https://example.com/stone.jpg'],
    ...overrides,
  };
};

export class ProductFixture {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    overrides: Partial<ValidProductDto> &
      Pick<ValidProductDto, 'categoryId' | 'ownerId'>,
  ) {
    const mockData = createValidProductDto(overrides);

    return this.prisma.product.create({
      data: {
        id: mockData.id,
        name: mockData.name,
        slug: mockData.slug,
        description: mockData.description,
        price: mockData.price,
        stock: mockData.stock,
        images: mockData.images,
        categoryId: mockData.categoryId,
        ownerId: mockData.ownerId,
      },
    });
  }

  async cleanDB() {
    await this.prisma.product.deleteMany({
      where: { slug: { contains: SLUG_PREFIX } },
    });
  }
}
