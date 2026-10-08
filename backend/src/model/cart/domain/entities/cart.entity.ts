import { CartItemEntity } from './cart-item.entity';

import type { CartItem } from '@/generated/prisma/client';

export class CartEntity {
  readonly id: string;
  readonly userId: string;
  readonly items: CartItemEntity[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    userId: string;
    items: CartItemEntity[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.items = props.items;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static fromPersistence(raw: {
    id: string;
    userId: string;
    items: CartItem[];
    createdAt: Date;
    updatedAt: Date;
  }): CartEntity {
    return new CartEntity({
      id: raw.id,
      userId: raw.userId,
      items: raw.items.map((item) => CartItemEntity.fromPersistence(item)),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
