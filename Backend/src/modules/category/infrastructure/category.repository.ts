import { CategoryEntity } from '@modules/category/domain/entities';
import {
  ICategoryRepository,
  ICreateCategoryData,
  IFindManyCategoryParams,
  IUpdateCategoryData,
} from '@modules/category/domain/interfaces';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@shared/prisma';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: ICreateCategoryData): Promise<CategoryEntity> {
    try {
      const created = await this.prisma.category.create({ data });
      return this.toEntity(created);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
      
        throw new ConflictException(
          'Category with this name or slug already exists',
        );
      }

      this.logger.error(e);
      throw e;
    }
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    const found = await this.prisma.category.findUnique({ where: { id } });

    return found ? this.toEntity(found) : null;
  }
  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const found = await this.prisma.category.findUnique({ where: { slug } });

    return found ? this.toEntity(found) : null;
  }
  async findMany(
    params: IFindManyCategoryParams,
  ): Promise<{ items: CategoryEntity[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        orderBy: { name: 'asc' },
        skip: params.skip,
        take: params.take,
      }),
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

  async findByName(name: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    });
    return category ? this.toEntity(category) : null;
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
