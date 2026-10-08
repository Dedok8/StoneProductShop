import { Inject, Injectable } from '@nestjs/common';
import { slugify } from '@stone-shop/shared';

import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/model/category/application/dto';
import { CategoryMapper } from '@/model/category/application/mapper';
import {
  CATEGORY_REPOSITORY,
  type ICategoryRepository,
} from '@/model/category/domain/interfaces';
import { assertFound, ensureUnique, ensureUniqueSlug } from '@/shared';
import { AppError } from '@/shared/error';

@Injectable()
export class CategoryService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async findById(id: string) {
    const category = await this.categoryRepository.findById(id);

    if (!category) throw AppError.notFound('Category not found');

    return CategoryMapper.toResponse(category);
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepository.findBySlug(slug);

    if (!category) throw AppError.notFound('Slug not found');

    return CategoryMapper.toResponse(category);
  }

  async findByName(name: string) {
    const category = await this.categoryRepository.findByName(name);

    if (!category) throw AppError.notFound('Category not found');

    return CategoryMapper.toResponse(category);
  }

  async findAll() {
    const categories = await this.categoryRepository.findAll();

    return CategoryMapper.toResponseList(categories);
  }

  async create(dto: CreateCategoryDto) {
    await ensureUnique(
      () => this.categoryRepository.findByName(dto.name),
      undefined,
      'Category name is already in use',
    );

    const baseSlug = slugify(dto.slug?.trim() || dto.name);

    const slug = await ensureUniqueSlug(baseSlug, async (candidate) =>
      Boolean(await this.categoryRepository.findBySlug(candidate)),
    );

    const created = await this.categoryRepository.create({ ...dto, slug });
    return CategoryMapper.toResponse(created);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    assertFound(
      await this.categoryRepository.findById(id),
      'Category id is not found',
    );

    if (dto.name)
      await ensureUnique(
        () => this.categoryRepository.findByName(dto.name!),
        id,
        'Category name is already in use',
      );
    if (dto.slug)
      await ensureUnique(
        () => this.categoryRepository.findBySlug(dto.slug!),
        id,
        'Category slug is already in use',
      );

    const updated = assertFound(
      await this.categoryRepository.update(id, dto),
      'Category not found',
    );
    return CategoryMapper.toResponse(updated);
  }

  async delete(id: string) {
    assertFound(
      await this.categoryRepository.findById(id),
      'Category not found',
    );
    await this.categoryRepository.delete(id);
  }
}
