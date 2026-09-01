import type { CategoryEntity } from '@/model/category/domain/entities';

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
    ownerId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ProductEntity {
    return new ProductEntity({ ...raw, price: raw.price.toNumber() });
  }
}
