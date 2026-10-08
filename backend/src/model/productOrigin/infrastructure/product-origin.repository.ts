import { Injectable } from '@nestjs/common';

import { Origin } from '@/generated/prisma';
import {
  ICreateProductOriginData,
  IProductOriginRepository,
  IUpdateProductOriginData,
  ProductOriginsEntity,
} from '@/model/productOrigin/domain';
import {
  createAndInvalidate,
  deleteAndInvalidate,
  findOneCached,
  mapToEntity,
  PrismaService,
  RedisCacheService,
  updateAndInvalidate,
} from '@/shared';

const LIST_TTL_SEC = 60;
const DETAIL_TTL_SEC = 5 * 60;

const listKey = () => 'productOrigin:list';
const listPattern = () => 'productOrigin:list*';
const idKey = (id: string) => `productOrigin:id:${id}`;
const slugKey = (slug: string) => `productOrigin:slug:${slug}`;

const PRODUCT_CACHE_PATTERNS = [
  'product:id:*',
  'product:slug:*',
  'product:list*',
];

@Injectable()
export class ProductOriginRepository implements IProductOriginRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  async findAll(): Promise<ProductOriginsEntity[]> {
    const cached = await this.cache.getJson<Origin[]>(listKey());

    if (cached) return cached.map((c) => mapToEntity(c, ProductOriginsEntity));

    const productOrigins = await this.prisma.origin.findMany();
    await this.cache.setJson(listKey(), productOrigins, LIST_TTL_SEC);

    return productOrigins.map((c) => mapToEntity(c, ProductOriginsEntity));
  }

  async findByName(name: string): Promise<ProductOriginsEntity | null> {
    const productOrigin = await this.prisma.origin.findUnique({
      where: { name },
    });

    return productOrigin
      ? mapToEntity(productOrigin, ProductOriginsEntity)
      : null;
  }

  async findBySlug(slug: string): Promise<ProductOriginsEntity | null> {
    const productOrigin = await this.prisma.origin.findUnique({
      where: { slug },
    });
    return productOrigin
      ? mapToEntity(productOrigin, ProductOriginsEntity)
      : null;
  }

  async findById(id: string): Promise<ProductOriginsEntity | null> {
    return findOneCached({
      cache: this.cache,
      key: idKey(id),
      ttl: DETAIL_TTL_SEC,
      fetch: () => this.prisma.origin.findUnique({ where: { id } }),
      entityClass: ProductOriginsEntity,
    });
  }
  async create(data: ICreateProductOriginData): Promise<ProductOriginsEntity> {
    return createAndInvalidate({
      createFn: () =>
        this.prisma.origin.create({
          data: { name: data.name, slug: data.slug },
        }),
      cache: this.cache,
      invalidateKeys: (productOrigin) => [
        idKey(productOrigin.id),
        slugKey(productOrigin.slug),
        listPattern(),
      ],
      entityClass: ProductOriginsEntity,
    });
  }

  async update(
    id: string,
    data: IUpdateProductOriginData,
  ): Promise<ProductOriginsEntity | null> {
    const existing = await this.prisma.origin.findUnique({
      where: { id },
    });
    return updateAndInvalidate({
      updateFn: () => this.prisma.origin.update({ where: { id }, data }),
      cache: this.cache,
      invalidateKeys: (productOrigin) => [
        idKey(productOrigin.id),
        slugKey(productOrigin.slug),
        ...(existing && existing.slug !== productOrigin.slug
          ? [slugKey(existing.slug)]
          : []),
        listPattern(),
        ...PRODUCT_CACHE_PATTERNS,
      ],
      entityClass: ProductOriginsEntity,
    });
  }

  async delete(id: string): Promise<void> {
    return deleteAndInvalidate({
      deleteFn: () => this.prisma.origin.delete({ where: { id } }),
      cache: this.cache,
      invalidateKeys: (productOrigin) => [
        idKey(productOrigin.id),
        slugKey(productOrigin.slug),
        listPattern(),
        ...PRODUCT_CACHE_PATTERNS,
      ],
    });
  }
}
