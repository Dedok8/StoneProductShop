import { randomUUID } from 'crypto';

import {
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@modules/category/application/dto';
import { CategoryEntity } from '@modules/category/domain/entities';
import {
  CATEGORY_REPOSITORY,
  type ICategoryRepository,
} from '@modules/category/domain/interfaces';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepo: ICategoryRepository,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const slug = this.buildSlug(dto.name);

    const existing = await this.categoryRepo.findBySlug(slug);
    if (existing) {
      throw new ConflictException(`Product with slug "${slug}" already exists`);
    }

    return this.categoryRepo.create({ ...dto, slug });
  }

  async findById(id: string): Promise<CategoryEntity> {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return category;
  }

  async findMany(query: CategoryQueryDto): Promise<{
    items: CategoryEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.categoryRepo.findMany({
      skip: query.skip,
      take: query.limit,
    });

    return { ...result, page: query.page, limit: query.limit };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    const updateData = dto.name
      ? { ...dto, slug: this.buildSlug(dto.name) }
      : dto;

    return this.categoryRepo.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    await this.categoryRepo.delete(id);
  }

  private buildSlug(name: string): string {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return `${base}-${randomUUID().slice(0, 8)}`;
  }
}
