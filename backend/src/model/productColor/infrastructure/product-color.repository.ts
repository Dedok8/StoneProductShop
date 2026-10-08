import { Injectable } from '@nestjs/common';

import { Color } from '@/generated/prisma';
import {
  ICreateProductColorData,
  IProductColorRepository,
  IUpdateProductColorData,
  ProductColorEntity,
} from '@/model/productColor/domain';
import {
  createAndInvalidate,
  deleteAndInvalidate,
  mapToEntity,
  PrismaService,
  RedisCacheService,
  updateAndInvalidate,
} from '@/shared';

const LIST_TTL_SEC = 60;

const listKey = () => 'productColor:list';
const listPattern = () => 'productColor:list*';
const idKey = (id: string) => `productColor:id:${id}`;

const PRODUCT_CACHE_PATTERNS = [
  'product:id:*',
  'product:slug:*',
  'product:list*',
];

@Injectable()
export class ProductColorRepository implements IProductColorRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}
  async findAll(): Promise<ProductColorEntity[]> {
    const cached = await this.cache.getJson<Color[]>(listKey());

    if (cached) return cached.map((c) => mapToEntity(c, ProductColorEntity));

    const productColor = await this.prisma.color.findMany();
    await this.cache.setJson(listKey(), productColor, LIST_TTL_SEC);

    return productColor.map((c) => mapToEntity(c, ProductColorEntity));
  }
  async findById(id: string): Promise<ProductColorEntity | null> {
    const color = await this.prisma.color.findUnique({ where: { id } });

    return color ? mapToEntity(color, ProductColorEntity) : null;
  }
  async findByName(name: string): Promise<ProductColorEntity | null> {
    const colorName = await this.prisma.color.findUnique({ where: { name } });

    return colorName ? mapToEntity(colorName, ProductColorEntity) : null;
  }
  async create(data: ICreateProductColorData): Promise<ProductColorEntity> {
    return createAndInvalidate({
      createFn: () =>
        this.prisma.color.create({
          data: { name: data.name, hex: data.hex },
        }),
      cache: this.cache,
      invalidateKeys: (productColor: Color) => [
        idKey(productColor.id),
        listPattern(),
        ...PRODUCT_CACHE_PATTERNS,
      ],
      entityClass: ProductColorEntity,
    });
  }
  async update(
    id: string,
    data: IUpdateProductColorData,
  ): Promise<ProductColorEntity | null> {
    const existing = await this.prisma.color.findUnique({
      where: { id },
    });

    if (!existing) return null;

    return updateAndInvalidate({
      updateFn: () => this.prisma.color.update({ where: { id }, data }),
      cache: this.cache,
      invalidateKeys: (productColor: Color) => [
        idKey(productColor.id),
        listPattern(),
        ...PRODUCT_CACHE_PATTERNS,
      ],
      entityClass: ProductColorEntity,
    });
  }
  async delete(id: string): Promise<void> {
    return deleteAndInvalidate({
      deleteFn: () => this.prisma.color.delete({ where: { id } }),
      cache: this.cache,
      invalidateKeys: (productColor: Color) => [
        idKey(productColor.id),
        listPattern(),
        ...PRODUCT_CACHE_PATTERNS,
      ],
    });
  }
}
