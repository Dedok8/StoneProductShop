import { CategoryEntity } from '@/model/category/domain/entities';
import type { ProductColorEntity } from '@/model/productColor/domain';
import type { ProductOriginsEntity } from '@/model/productOrigin/domain';
import type { ProductTypesEntity } from '@/model/productType/domain';

export interface IProductImageProps {
  id: string;
  url: string;
  alt: string;
  order: number;
}
export class ProductEntity {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly price: number;
  readonly stock: number;
  readonly images: IProductImageProps[];
  readonly categoryId: string;
  readonly category: CategoryEntity;
  readonly productTypeId: string | null;
  readonly productType: ProductTypesEntity | null;
  readonly originId: string | null;
  readonly origin: ProductOriginsEntity | null;
  readonly colorId: string | null;
  readonly color: ProductColorEntity | null;
  readonly ownerId: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    stock: number;
    images: IProductImageProps[];
    categoryId: string;
    category: CategoryEntity;
    productTypeId: string | null;
    productType: ProductTypesEntity | null;
    originId: string | null;
    origin: ProductOriginsEntity | null;
    colorId: string | null;
    color: ProductColorEntity | null;
    ownerId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.price = props.price;
    this.stock = props.stock;
    this.images = [...props.images].sort((a, b) => a.order - b.order);
    this.categoryId = props.categoryId;
    this.category = props.category;
    this.productTypeId = props.productTypeId;
    this.productType = props.productType;
    this.originId = props.originId;
    this.origin = props.origin;
    this.colorId = props.colorId;
    this.color = props.color;
    this.ownerId = props.ownerId;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromPersistence(raw: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: { toNumber(): number };
    stock: number;
    images: IProductImageProps[];
    categoryId: string;
    category: Parameters<typeof CategoryEntity.fromPersistence>[0];
    productTypeId: string | null;
    productType:
      | Parameters<typeof ProductTypesEntity.fromPersistence>[0]
      | null;
    originId: string | null;
    origin: Parameters<typeof ProductOriginsEntity.fromPersistence>[0] | null;
    colorId: string | null;
    color: Parameters<typeof ProductColorEntity.fromPersistence>[0] | null;
    ownerId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ProductEntity {
    return new ProductEntity({
      ...raw,
      price: raw.price.toNumber(),
      category: CategoryEntity.fromPersistence(raw.category),
    });
  }
}
