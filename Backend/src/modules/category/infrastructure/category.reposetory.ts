import { CategoryEntity } from '@modules/category/domain/entities';
import {
  ICategoryRepository,
  ICreateCategoryData,
  IUpdateCategoryData,
} from '@modules/category/domain/interfaces';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ICreateCategoryData): Promise<CategoryEntity> {
    const created = await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });

    return this.toEntity(created);
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const found = await this.prisma.category.findUnique({ where: { id } });

    return found ? this.toEntity(found) : null;
  }
  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const found = await this.prisma.category.findUnique({ where: { slug } });

    return found ? this.toEntity(found) : null;
  }
  async findMany(): Promise<{ items: CategoryEntity[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.category.count(),
    ]);

    return { items: items.map((item) => this.toEntity(item)), total };
  }

  async update(id: string, data: IUpdateCategoryData): Promise<CategoryEntity> {
    const updated = await this.prisma.category.update({
      where: { id },
      data,
    });

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } });
  }

  private toEntity(raw: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  }): CategoryEntity {
    return new CategoryEntity(raw);
  }
}
