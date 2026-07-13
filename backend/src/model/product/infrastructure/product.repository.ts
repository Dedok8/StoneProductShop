import { Injectable } from '@nestjs/common';

import { Product } from '@/generated/prisma/client';
import {
  ICreateProductData,
  IProductAllResultData,
  IProductQuery,
  IProductRepository,
  IUpdateProductData,
  ProductEntity,
} from '@/model/product/domain';
import {
  buildContainsFilter,
  buildQueryCacheKey,
  createAndInvalidate,
  deleteAndInvalidate,
  findManyCached,
  findOneCached,
  mapToEntity,
  PrismaService,
  RedisCacheService,
} from '@/shared';
import { updateAndInvalidate } from '@/shared/utils/update-and-invalidate.utils';

const LIST_TTL_SEC = 60;
const DETAIL_TTL_SEC = 5 * 60;

const idKey = (id: string) => `product:id:${id}`;
const slugKey = (slug: string) => `product:slug:${slug}`;
const listPattern = 'product:list*';
const listKey = (query: IProductQuery) =>
  buildQueryCacheKey('product:list', query);

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  findById(id: string): Promise<ProductEntity | null> {
    return findOneCached({
      cache: this.cache,
      key: idKey(id),
      ttl: DETAIL_TTL_SEC,
      fetch: () => this.prisma.product.findUnique({ where: { id } }),
      entityClass: ProductEntity,
    });
  }

  findBySlug(slug: string): Promise<ProductEntity | null> {
    return findOneCached({
      cache: this.cache,
      key: slugKey(slug),
      ttl: DETAIL_TTL_SEC,
      fetch: () => this.prisma.product.findUnique({ where: { slug } }),
      entityClass: ProductEntity,
    });
  }

  async findByName(name: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findFirst({ where: { name } });
    return product ? mapToEntity(product, ProductEntity) : null;
  }

  findAll(query: IProductQuery): Promise<IProductAllResultData> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      name: query.search ? buildContainsFilter(query.search) : undefined,
      categoryId: query.categoryId ?? undefined,
    };

    return findManyCached<Product, Product, ProductEntity>({
      cache: this.cache,
      key: listKey(query),
      ttl: LIST_TTL_SEC,
      entityClass: ProductEntity,
      fetch: async () => {
        const [items, total] = await Promise.all([
          this.prisma.product.findMany({
            where,
            orderBy: query.sortBy
              ? { [query.sortBy]: query.sortOrder ?? 'asc' }
              : { createdAt: query.sortOrder ?? 'desc' },
            skip: (page - 1) * limit,
            take: limit,
          }),
          this.prisma.product.count({ where }),
        ]);

        return { items, total };
      },
    });
  }

  create(data: ICreateProductData): Promise<ProductEntity> {
    return createAndInvalidate({
      createFn: () =>
        this.prisma.product.create({
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            price: data.price,
            stock: data.stock,
            images: data.images,
            categoryId: data.categoryId,
            ownerId: data.ownerId,
          },
        }),
      cache: this.cache,
      invalidateKeys: (product) => [
        idKey(product.id),
        slugKey(product.slug),
        listPattern,
      ],
      entityClass: ProductEntity,
    });
  }

  update(id: string, data: IUpdateProductData): Promise<ProductEntity | null> {
    return updateAndInvalidate({
      updateFn: () => this.prisma.product.update({ where: { id }, data }),
      cache: this.cache,
      invalidateKeys: (product) => [
        idKey(product.id),
        slugKey(product.slug),
        listPattern,
      ],
      entityClass: ProductEntity,
    });
  }

  delete(id: string): Promise<void> {
    return deleteAndInvalidate({
      deleteFn: () => this.prisma.product.delete({ where: { id } }),
      cache: this.cache,
      invalidateKeys: (product) => [
        idKey(product.id),
        slugKey(product.slug),
        listPattern,
      ],
    });
  }
}
