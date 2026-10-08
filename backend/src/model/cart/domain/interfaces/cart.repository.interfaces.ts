import type { CartEntity } from '@/model/cart/domain/entities';

export interface ICartRepository {
  findByUserId(userId: string): Promise<CartEntity | null>;
  getOrCreate(userId: string): Promise<CartEntity>;
  addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartEntity>;
  setItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartEntity>;
  removeItem(userId: string, productId: string): Promise<CartEntity>;
  clear(userId: string): Promise<void>;
}

export const CART_REPOSITORY = Symbol('CART_REPOSITORY');
