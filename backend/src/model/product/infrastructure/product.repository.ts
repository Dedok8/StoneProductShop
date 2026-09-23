import { Injectable } from '@nestjs/common';

import {
  Category,
  Color,
  Origin,
  Prisma,
  Product,
  ProductType,
} from '@/generated/prisma/client';
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

type ProductWithRelations = Product & {
  images: { id: string; url: string; alt: string; order: number }[];
  category: Category;
  productType: ProductType | null;
  color: Color | null;
  origin: Origin | null;
};

function getRelevanceScore(
  product: ProductWithRelations,
  query: string,
): number {
  const q = query.toLowerCase().trim();
  if (!q) return 100;

  const name = product.name.toLowerCase();
  const slug = product.slug.toLowerCase();
  const category = product.category?.name?.toLowerCase() ?? '';
  const productType = product.productType?.name?.toLowerCase() ?? '';
  const origin = product.origin?.name?.toLowerCase() ?? '';
  const color = product.color?.name?.toLowerCase() ?? '';

  if (name === q) return 0;
  if (name.startsWith(q)) return 1;
  if (name.split(/\s+/).some((word) => word.startsWith(q))) return 2;
  if (name.includes(q)) return 3;

  if (slug === q || slug.startsWith(q)) return 4;
  if (slug.includes(q)) return 5;

  if (category.includes(q)) return 6;
  if (productType.includes(q)) return 7;
  if (origin.includes(q) || color.includes(q)) return 8;

  return 9;
}

type ProductCached = Omit<ProductWithRelations, 'price'> & { price: number };

const priceToCache = (raw: ProductWithRelations): ProductCached => ({
  ...raw,
  price: raw.price.toNumber(),
});

const priceFromCache = (cached: ProductCached): ProductWithRelations => ({
  ...cached,
  price: new Prisma.Decimal(cached.price),
});

const PRODUCT_INCLUDE = {
  images: { orderBy: { order: 'asc' as const } },
  category: true,
  productType: true,
  origin: true,
  color: true,
} as const;

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  async findByIds(ids: string[]): Promise<ProductEntity[]> {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return [];

    const products = await this.prisma.product.findMany({
      where: { id: { in: unique } },
      include: PRODUCT_INCLUDE,
    });

    return products.map((p) => mapToEntity(p, ProductEntity));
  }

  findById(id: string): Promise<ProductEntity | null> {
    return findOneCached<ProductCached, ProductWithRelations, ProductEntity>({
      cache: this.cache,
      key: idKey(id),
      ttl: DETAIL_TTL_SEC,
      fetch: () =>
        this.prisma.product.findUnique({
          where: { id },
          include: PRODUCT_INCLUDE,
        }),
      entityClass: ProductEntity,
      toCache: priceToCache,
      fromCache: priceFromCache,
    });
  }

  findBySlug(slug: string): Promise<ProductEntity | null> {
    return findOneCached<ProductCached, ProductWithRelations, ProductEntity>({
      cache: this.cache,
      key: slugKey(slug),
      ttl: DETAIL_TTL_SEC,
      fetch: () =>
        this.prisma.product.findUnique({
          where: { slug },
          include: PRODUCT_INCLUDE,
        }),
      entityClass: ProductEntity,
      toCache: priceToCache,
      fromCache: priceFromCache,
    });
  }

  async findByName(name: string): Promise<ProductEntity | null> {
    const product = await this.prisma.product.findFirst({
      where: { name },
      include: PRODUCT_INCLUDE,
    });
    return product ? mapToEntity(product, ProductEntity) : null;
  }

  async search(query: string): Promise<ProductEntity[]> {
    const contains = buildContainsFilter(query);

    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          {
            name: contains,
          },
          {
            slug: contains,
          },
          {
            category: {
              name: contains,
            },
          },
          {
            productType: {
              name: contains,
            },
          },
          {
            origin: {
              name: contains,
            },
          },
          {
            color: {
              name: contains,
            },
          },
        ],
      },
      include: PRODUCT_INCLUDE,
      take: 60,
    });

    const sorted = [...products].sort((a, b) => {
      const scoreDiff =
        getRelevanceScore(a, query) - getRelevanceScore(b, query);

      if (scoreDiff !== 0) return scoreDiff;

      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return sorted.slice(0, 20).map((p) => mapToEntity(p, ProductEntity));
  }

  findAll(query: IProductQuery): Promise<IProductAllResultData> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where = {
      name: query.search ? buildContainsFilter(query.search) : undefined,
      categoryId: query.categoryId ?? undefined,
      productTypeId: query.productTypeId ?? undefined,
      originId: query.originId ?? undefined,
      colorId: query.colorId ?? undefined,
    };

    return findManyCached<ProductCached, ProductWithRelations, ProductEntity>({
      cache: this.cache,
      key: listKey(query),
      ttl: LIST_TTL_SEC,
      entityClass: ProductEntity,
      toCache: priceToCache,
      fromCache: priceFromCache,
      fetch: async () => {
        const [items, total] = await Promise.all([
          this.prisma.product.findMany({
            where,
            include: PRODUCT_INCLUDE,
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
            category: { connect: { id: data.categoryId } },
            productType: data.productTypeId
              ? { connect: { id: data.productTypeId } }
              : undefined,
            origin: data.originId
              ? { connect: { id: data.originId } }
              : undefined,
            color: data.colorId ? { connect: { id: data.colorId } } : undefined,
            owner: { connect: { id: data.ownerId } },
            images: {
              create: data.images.map((img, index) => ({
                url: img.url,
                alt: img.alt ?? '',
                order: index,
              })),
            },
          },
          include: PRODUCT_INCLUDE,
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
      updateFn: () =>
        this.prisma.product.update({
          where: { id },
          data: {
            name: data.name,
            slug: data.slug,
            description: data.description,
            price: data.price,
            stock: data.stock,
            isActive: data.isActive,
            category: data.categoryId
              ? { connect: { id: data.categoryId } }
              : undefined,
            productType: data.productTypeId
              ? { connect: { id: data.productTypeId } }
              : undefined,
            origin: data.originId
              ? { connect: { id: data.originId } }
              : undefined,
            color: data.colorId ? { connect: { id: data.colorId } } : undefined,
            images: data.images
              ? {
                  deleteMany: {},
                  create: data.images.map((img, index) => ({
                    url: img.url,
                    alt: img.alt ?? '',
                    order: index,
                  })),
                }
              : undefined,
          },
          include: PRODUCT_INCLUDE,
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
