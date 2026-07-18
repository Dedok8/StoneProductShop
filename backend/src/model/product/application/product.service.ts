import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  CATEGORY_REPOSITORY,
  type ICategoryRepository,
} from '@/model/category/domain/interfaces';
import {
  CreateProductDto,
  PaginatedProductResponseDto,
  UpdateProductDto,
} from '@/model/product/application/dto';
import { ProductQueryDto } from '@/model/product/application/dto/product.query.dto';
import { ProductMapper } from '@/model/product/application/mapper';
import {
  type IProductRepository,
  PRODUCT_REPOSITORY,
} from '@/model/product/domain';
import { assertFound, ensureUnique, PaginationMetaDto } from '@/shared';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async findById(id: string) {
    const product = await this.productRepository.findById(id);

    if (!product) throw new NotFoundException('Product not found');

    return ProductMapper.toResponse(product);
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findBySlug(slug);

    if (!product) throw new NotFoundException('Slug not found');

    return ProductMapper.toResponse(product);
  }

  async findByName(name: string) {
    const product = await this.productRepository.findByName(name);

    if (!product) throw new NotFoundException('Product not found');

    return ProductMapper.toResponse(product);
  }

  async findAll(query: ProductQueryDto): Promise<PaginatedProductResponseDto> {
    const { items, total } = await this.productRepository.findAll(query);

    return new PaginatedProductResponseDto({
      items: ProductMapper.toResponseList(items),
      meta: new PaginationMetaDto({
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total,
      }),
    });
  }

  async create(dto: CreateProductDto, ownerId: string) {
    await ensureUnique(
      () => this.productRepository.findByName(dto.name),
      undefined,
      'Product name is already in use',
    );
    await ensureUnique(
      () => this.productRepository.findBySlug(dto.slug),
      undefined,
      'Product slug is already in use',
    );

    const category = await this.categoryRepository.findById(dto.categoryId);
    if (!category) {
      throw new BadRequestException(
        `Category with id "${dto.categoryId}" does not exist`,
      );
    }

    const created = await this.productRepository.create({ ...dto, ownerId });
    return ProductMapper.toResponse(created);
  }

  async update(id: string, dto: UpdateProductDto) {
    if (dto.name)
      await ensureUnique(
        () => this.productRepository.findByName(dto.name!),
        id,
        'Product name is already in use',
      );
    if (dto.slug)
      await ensureUnique(
        () => this.productRepository.findBySlug(dto.slug!),
        id,
        'Product slug is already in use',
      );

    const updated = assertFound(
      await this.productRepository.update(id, dto),
      'Product not found',
    );
    return ProductMapper.toResponse(updated);
  }

  async delete(id: string) {
    assertFound(await this.productRepository.findById(id), 'Product not found');
    await this.productRepository.delete(id);
  }
}
