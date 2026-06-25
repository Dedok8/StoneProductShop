import { randomUUID } from 'crypto';

import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from '@modules/product/application/dto';
import { ProductCacheService } from '@modules/product/application/product-cache.service';
import { PRODUCT_REPOSITORY } from '@modules/product/domain';
import type {
  IProductRepository,
  ProductEntity,
} from '@modules/product/domain';
import { UserRole } from '@modules/user/domain';
import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class ProductService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
    private readonly cache: ProductCacheService,
  ) {}

  async create(dto: CreateProductDto, ownerId: string) {
    const slug = this.buildSlug(dto.name);

    const existing = await this.productRepo.findBySlug(slug);

    if (existing) {
      throw new ConflictException(`Product with slug "${slug}" already exists`);
    }

    return this.productRepo.create({
      ...dto,
      slug,
      ownerId,
    });
  }

  async findById(id: string): Promise<ProductEntity> {
    const cached = await this.cache.getDetail(id);
    if (cached) {
      return cached;
    }

    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    await this.cache.setDetail(id, product);
    return product;
  }

  async findMany(query: ProductQueryDto): Promise<{
    items: ProductEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const cacheParams = {
      categoryId: query.categoryId,
      ownerId: query.ownerId,
      page: query.page,
      limit: query.limit,
    };

    const cached = await this.cache.getList(cacheParams);
    if (cached) {
      return { ...cached, page: query.page, limit: query.limit };
    }

    const result = await this.productRepo.findMany({
      categoryId: query.categoryId,
      ownerId: query.ownerId,
      isActive: query.isActive ?? true,
      skip: query.skip,
      take: query.limit,
    });

    await this.cache.setList(cacheParams, result);

    return { ...result, page: query.page, limit: query.limit };
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    requester: { userId: string; role: string },
  ): Promise<ProductEntity> {
    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    this.assertCanModify(product, requester);

    const updateDate = dto.name
      ? { ...dto, slug: this.buildSlug(dto.name) }
      : dto;

    const updated = await this.productRepo.update(id, updateDate);

    await this.cache.invalidateDetail(id);
    return updated;
  }

  async delete(
    id: string,
    requester: { userId: string; role: string },
  ): Promise<void> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    this.assertCanModify(product, requester);

    await this.productRepo.delete(id);
    await this.cache.invalidateDetail(id);
  }

  private assertCanModify(
    product: ProductEntity,
    requester: { userId: string; role: string },
  ): void {
    const isAdmin = requester.role === UserRole.ADMIN; // was: 'ADMIN'
    const isOwner = product.isOwnerById(requester.userId);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You do not have permission to modify this product',
      );
    }
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
