import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  CreateProductColorDto,
  UpdateProductColorDto,
} from '@/model/productColor/application/dto';
import { ProductColorMapper } from '@/model/productColor/application/mapper';
import { PRODUCT_COLOR_REPOSITORY } from '@/model/productColor/domain';
import { ProductColorRepository } from '@/model/productColor/infrastructure/product-color.repository';
import { assertFound, ensureUnique } from '@/shared';

@Injectable()
export class ProductColorService {
  constructor(
    @Inject(PRODUCT_COLOR_REPOSITORY)
    private readonly productColorRepository: ProductColorRepository,
  ) {}

  async findAll() {
    const productColor = await this.productColorRepository.findAll();

    return ProductColorMapper.toResponseList(productColor);
  }

  async findById(id: string) {
    const productColor = await this.productColorRepository.findById(id);

    if (!productColor) throw new NotFoundException('Product color not found');

    return ProductColorMapper.toResponse(productColor);
  }

  async findByName(name: string) {
    const productColor = await this.productColorRepository.findByName(name);

    if (!productColor) throw new NotFoundException('Product color not found');

    return ProductColorMapper.toResponse(productColor);
  }

  async create(dto: CreateProductColorDto) {
    await ensureUnique(
      () => this.productColorRepository.findByName(dto.name),
      undefined,
      'Product color is already in use',
    );

    const created = await this.productColorRepository.create({
      name: dto.name,
      hex: dto.hex ?? undefined,
    });

    return ProductColorMapper.toResponse(created);
  }

  async update(id: string, dto: UpdateProductColorDto) {
    assertFound(
      await this.productColorRepository.findById(id),
      'Product color is not found',
    );

    if (dto.name)
      await ensureUnique(
        () => this.productColorRepository.findByName(dto.name!),
        id,
        'Product color name is already in use',
      );

    const updated = assertFound(
      await this.productColorRepository.update(id, {
        name: dto.name,
        hex: dto.hex ?? undefined,
      }),
      'Product color is not found',
    );

    return ProductColorMapper.toResponse(updated);
  }

  async delete(id: string) {
    assertFound(
      await this.productColorRepository.findById(id),
      'Product color is not found',
    );

    await this.productColorRepository.delete(id);
  }
}
