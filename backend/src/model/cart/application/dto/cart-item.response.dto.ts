export class CartItemResponseDto {
  readonly productId: string;
  readonly quantity: number;
  readonly name: string;
  readonly price: number;
  readonly isStock: boolean;
  constructor(props: {
    productId: string;
    quantity: number;
    name: string;
    price: number;
    isStock: boolean;
  }) {
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.name = props.name;
    this.price = props.price;
    this.isStock = props.isStock;
  }
}
