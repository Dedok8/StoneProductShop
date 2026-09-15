import { Injectable } from '@nestjs/common';

import { ProductType } from '@/generated/prisma';
import {
  ICreateProductTypeData,
  IProductTypeRepository,
  IUpdateProductTypeData,
  ProductTypesEntity,
} from '@/model/productType/domain';
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

const listKey = () => 'productType:list';
const listPattern = () => 'productType:list*';
const idKey = (id: string) => `productType:id:${id}`;
const slugKey = (slug: string) => `productType:slug:${slug}`;

const PRODUCT_CACHE_PATTERNS = [
  'product:id:*',
  'product:slug:*',
  'product:list*',
];

@Injectable()
export class ProductTypeRepository implements IProductTypeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  async findAll(): Promise<ProductTypesEntity[]> {
    const cached = await this.cache.getJson<ProductType[]>(listKey());

    if (cached) return cached.map((c) => mapToEntity(c, ProductTypesEntity));

    const productTypes = await this.prisma.productType.findMany();
    await this.cache.setJson(listKey(), productTypes, LIST_TTL_SEC);

    return productTypes.map((c) => mapToEntity(c, ProductTypesEntity));
  }

  async findByName(name: string): Promise<ProductTypesEntity | null> {
    const productType = await this.prisma.productType.findUnique({
      where: { name },
    });

    return productType ? mapToEntity(productType, ProductTypesEntity) : null;
  }

  async findBySlug(slug: string): Promise<ProductTypesEntity | null> {
    const productType = await this.prisma.productType.findUnique({
      where: { slug },
    });
    return productType ? mapToEntity(productType, ProductTypesEntity) : null;
  }

  async findById(id: string): Promise<ProductTypesEntity | null> {
    return findOneCached({
      cache: this.cache,
      key: idKey(id),
      ttl: DETAIL_TTL_SEC,
      fetch: () => this.prisma.productType.findUnique({ where: { id } }),
      entityClass: ProductTypesEntity,
    });
  }
  async create(data: ICreateProductTypeData): Promise<ProductTypesEntity> {
    return createAndInvalidate({
      createFn: () =>
        this.prisma.productType.create({
          data: { name: data.name, slug: data.slug },
        }),
      cache: this.cache,
      invalidateKeys: (productType) => [
        idKey(productType.id),
        slugKey(productType.slug),
        listPattern(),
      ],
      entityClass: ProductTypesEntity,
    });
  }
  async update(
    id: string,
    data: IUpdateProductTypeData,
  ): Promise<ProductTypesEntity | null> {
    const existing = await this.prisma.productType.findUnique({
      where: { id },
    });

    return updateAndInvalidate({
      updateFn: () => this.prisma.productType.update({ where: { id }, data }),
      cache: this.cache,
      invalidateKeys: (productType) => [
        idKey(productType.id),
        slugKey(productType.slug),
        ...(existing && existing.slug !== productType.slug
          ? [slugKey(existing.slug)]
          : []),
        listPattern(),
        ...PRODUCT_CACHE_PATTERNS,
      ],
      entityClass: ProductTypesEntity,
    });
  }
  async delete(id: string): Promise<void> {
    return deleteAndInvalidate({
      deleteFn: () => this.prisma.productType.delete({ where: { id } }),
      cache: this.cache,
      invalidateKeys: (productType) => [
        idKey(productType.id),
        slugKey(productType.slug),
        listPattern(),
        ...PRODUCT_CACHE_PATTERNS,
      ],
    });
  }
}
