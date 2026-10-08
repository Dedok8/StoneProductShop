import { CartItemResponseDto } from '@/model/cart/application/dto/cart-item.response.dto';

export class CartResponseDto {
  readonly id: string;
  readonly userId: string;
  readonly items: CartItemResponseDto[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  constructor(props: {
    id: string;
    userId: string;
    items: CartItemResponseDto[];
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.items = props.items.map((i) => new CartItemResponseDto(i));
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
