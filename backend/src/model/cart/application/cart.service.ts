import { Inject, Injectable } from '@nestjs/common';

import { CartResponseDto } from '@/model/cart/application/dto';
import { CartMapper } from '@/model/cart/application/mapper';
import { CART_REPOSITORY, CartEntity } from '@/model/cart/domain';
import { CartRepository } from '@/model/cart/infrastructure';
import { ProductService } from '@/model/product';

@Injectable()
export class CartService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
    private readonly productService: ProductService,
  ) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    return this.cartRepository
      .getOrCreate(userId)
      .then((cart) => this.buildResponse(cart));
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartResponseDto> {
    const cart = await this.cartRepository.addItem(userId, productId, quantity);
    return this.buildResponse(cart);
  }

  async setItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartResponseDto> {
    const cart = await this.cartRepository.setItemQuantity(
      userId,
      productId,
      quantity,
    );

    return this.buildResponse(cart);
  }

  async removeItem(
    userId: string,
    productId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.cartRepository.removeItem(userId, productId);

    return this.buildResponse(cart);
  }

  async clear(userId: string): Promise<void> {
    await this.cartRepository.clear(userId);
  }

  async getRawItems(
    userId: string,
  ): Promise<{ productId: string; quantity: number }[]> {
    const cart = await this.cartRepository.getOrCreate(userId);
    return cart.items.map(({ productId, quantity }) => ({
      productId,
      quantity,
    }));
  }

  private async buildResponse(cart: CartEntity): Promise<CartResponseDto> {
    const products = await this.productService.findByIds(
      cart.items.map((i) => i.productId),
    );
    const productMap = new Map(products.map((p) => [p.id, p]));

    return CartMapper.toResponse(cart, productMap);
  }
}
