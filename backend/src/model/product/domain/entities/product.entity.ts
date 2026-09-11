import { CategoryEntity } from '@/model/category/domain/entities';
import type {
  ColorRef,
  OriginRef,
  ProductTypeRef,
} from '@/model/product/domain/entities/product-refs.types';

export class ProductEntity {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string | null;
  readonly price: number;
  readonly stock: number;
  readonly images: string[];
  readonly categoryId: string;
  readonly category: CategoryEntity;
  readonly productTypeId: string | null;
  readonly productType: ProductTypeRef | null;
  readonly originId: string | null;
  readonly origin: OriginRef | null;
  readonly colorId: string | null;
  readonly color: ColorRef | null;
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
    images: { imageUrl: string }[];
    categoryId: string;
    category: CategoryEntity;
    productTypeId: string | null;
    productType: ProductTypeRef | null;
    originId: string | null;
    origin: OriginRef | null;
    colorId: string | null;
    color: ColorRef | null;
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
    this.images = props.images.map((img) => img.imageUrl);
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
    images: { imageUrl: string }[];
    categoryId: string;
    category: Parameters<typeof CategoryEntity.fromPersistence>[0];
    productTypeId: string | null;
    productType: ProductTypeRef | null;
    originId: string | null;
    origin: OriginRef | null;
    colorId: string | null;
    color: ColorRef | null;
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
