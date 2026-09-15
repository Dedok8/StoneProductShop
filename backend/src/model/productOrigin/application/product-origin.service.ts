import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  CreateProductOriginDto,
  UpdateProductOriginDto,
} from '@/model/productOrigin/application/dto';
import { ProductOriginMapper } from '@/model/productOrigin/application/mapper';
import {
  PRODUCT_ORIGIN_REPOSITORY,
  type IProductOriginRepository,
} from '@/model/productOrigin/domain';
import { ensureUnique, ensureUniqueSlug, slugify, assertFound } from '@/shared';

@Injectable()
export class ProductOriginService {
  constructor(
    @Inject(PRODUCT_ORIGIN_REPOSITORY)
    private readonly productOriginRepository: IProductOriginRepository,
  ) {}

  async findAll() {
    const productOrigin = await this.productOriginRepository.findAll();

    return ProductOriginMapper.toResponseList(productOrigin);
  }

  async findByName(name: string) {
    const productOrigin = await this.productOriginRepository.findByName(name);

    if (!productOrigin) throw new NotFoundException('Product Origin not found');

    return ProductOriginMapper.toResponse(productOrigin);
  }

  async findById(id: string) {
    const productOrigin = await this.productOriginRepository.findById(id);

    if (!productOrigin) throw new NotFoundException('Product Origin not found');

    return ProductOriginMapper.toResponse(productOrigin);
  }

  async findBySlug(slug: string) {
    const productOrigin = await this.productOriginRepository.findBySlug(slug);

    if (!productOrigin) throw new NotFoundException('Slug not found');

    return ProductOriginMapper.toResponse(productOrigin);
  }



  async create(dto: CreateProductOriginDto) {
    await ensureUnique(
      () => this.productOriginRepository.findByName(dto.name),
      undefined,
      'Product Origin name is already in use',
    );

    const baseSlug = slugify(dto.slug?.trim() || dto.name);

    const slug = await ensureUniqueSlug(baseSlug, async (creditate) =>
      Boolean(await this.productOriginRepository.findBySlug(creditate)),
    );

    const created = await this.productOriginRepository.create({ ...dto, slug });

    return ProductOriginMapper.toResponse(created);
  }

  async update(id: string, dto: UpdateProductOriginDto) {
    assertFound(
      await this.productOriginRepository.findById(id),
      'Product Origin id is not found',
    );
    if (dto.name)
      await ensureUnique(
        () => this.productOriginRepository.findByName(dto.name!),
        id,
        'Product Origin name is already in use',
      );
    if (dto.slug)
      await ensureUnique(
        () => this.productOriginRepository.findBySlug(dto.slug!),
        id,
        'Product Origin slug is already in use',
      );

    const updated = assertFound(
      await this.productOriginRepository.update(id, dto),
      'Product Origin is not found',
    );

    return ProductOriginMapper.toResponse(updated);
  }

  async delete(id: string) {
    assertFound(
      await this.productOriginRepository.findById(id),
      'Product Origin is not found',
    );

    await this.productOriginRepository.delete(id);
  }
}
