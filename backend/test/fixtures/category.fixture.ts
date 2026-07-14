import { randomUUID } from 'node:crypto';

import type { CreateCategoryDto } from '@/model';
import type { PrismaService } from '@/shared';

export interface ValidCategoryDto extends CreateCategoryDto {
  id: string;
  isActive: boolean;
}

const SLUG_PREFIX = 'test-category-';

export const createValidCategoryDto = (
  overrides: Partial<ValidCategoryDto> = {},
): ValidCategoryDto => {
  const uniqueId = Math.floor(Math.random() * 100000);

  return {
    id: randomUUID(),
    name: `Test Category ${uniqueId}`,
    slug: `${SLUG_PREFIX}${uniqueId}`,
    isActive: true,
    ...overrides,
  };
};

export class CategoryFixture {
  constructor(private readonly prisma: PrismaService) {}

  async create(overrides: Partial<ValidCategoryDto> = {}) {
    const mockData = createValidCategoryDto(overrides);

    return this.prisma.category.create({
      data: {
        id: mockData.id,
        name: mockData.name,
        slug: mockData.slug,
        isActive: mockData.isActive,
      },
    });
  }

  async cleanDB() {
    await this.prisma.category.deleteMany({
      where: { slug: { contains: SLUG_PREFIX } },
    });
  }
}
