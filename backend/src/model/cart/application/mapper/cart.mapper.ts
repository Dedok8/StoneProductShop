import {
  CartResponseDto,
  CartItemResponseDto,
} from '@/model/cart/application/dto';
import type { CartEntity } from '@/model/cart/domain';
import type { ProductResponseDto } from '@/model/product/application/dto';

export class CartMapper {
  static toResponse(
    entity: CartEntity,
    products: Map<string, ProductResponseDto>,
  ): CartResponseDto {
    const items = entity.items.map((item) => {
      const product = products.get(item.productId);
      const available = Boolean(product?.isActive);

      return new CartItemResponseDto({
        productId: item.productId,
        quantity: item.quantity,
        name: product?.name ?? 'This item is out of stock',
        price: product?.price ?? 0,
        isStock: available ? product!.stock >= item.quantity : false,
      });
    });

    return new CartResponseDto({
      id: entity.id,
      userId: entity.userId,
      items,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
