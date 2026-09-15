import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  CreateProductTypeDto,
  UpdateProductTypeDto,
} from '@/model/productType/application/dto';
import { ProductTypeMapper } from '@/model/productType/application/mapper';
import {
  type IProductTypeRepository,
  PRODUCT_TYPE_REPOSITORY,
} from '@/model/productType/domain';
import { ensureUnique, ensureUniqueSlug, slugify, assertFound } from '@/shared';

@Injectable()
export class ProductTypeService {
  constructor(
    @Inject(PRODUCT_TYPE_REPOSITORY)
    private readonly productTypeRepository: IProductTypeRepository,
  ) {}

  async findAll() {
    const productType = await this.productTypeRepository.findAll();

    return ProductTypeMapper.toResponseList(productType);
  }

  async findByName(name: string) {
    const productType = await this.productTypeRepository.findByName(name);

    if (!productType) throw new NotFoundException('Product type not found');

    return ProductTypeMapper.toResponse(productType);
  }

  async findById(id: string) {
    const productType = await this.productTypeRepository.findById(id);

    if (!productType) throw new NotFoundException('Product type not found');

    return ProductTypeMapper.toResponse(productType);
  }
  async findBySlug(slug: string) {
    const productType = await this.productTypeRepository.findBySlug(slug);

    if (!productType) throw new NotFoundException('Slug not found');

    return ProductTypeMapper.toResponse(productType);
  }

  async create(dto: CreateProductTypeDto) {
    await ensureUnique(
      () => this.productTypeRepository.findByName(dto.name),
      undefined,
      'Product type name is already in use',
    );

    const baseSlug = slugify(dto.slug?.trim() || dto.name);

    const slug = await ensureUniqueSlug(baseSlug, async (creditate) =>
      Boolean(await this.productTypeRepository.findBySlug(creditate)),
    );

    const created = await this.productTypeRepository.create({ ...dto, slug });

    return ProductTypeMapper.toResponse(created);
  }

  async update(id: string, dto: UpdateProductTypeDto) {
    assertFound(
      await this.productTypeRepository.findById(id),
      'Product type id is not found',
    );
    if (dto.name)
      await ensureUnique(
        () => this.productTypeRepository.findByName(dto.name!),
        id,
        'Product type name is already in use',
      );
    if (dto.slug)
      await ensureUnique(
        () => this.productTypeRepository.findBySlug(dto.slug!),
        id,
        'Product type slug is already in use',
      );

    const updated = assertFound(
      await this.productTypeRepository.update(id, dto),
      'Product type is not found',
    );

    return ProductTypeMapper.toResponse(updated);
  }

  async delete(id: string) {
    assertFound(
      await this.productTypeRepository.findById(id),
      'Product type is not found',
    );

    await this.productTypeRepository.delete(id);
  }
}
