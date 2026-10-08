export class CartItemEntity {
  readonly productId: string;
  readonly quantity: number;

  constructor(props: { productId: string; quantity: number }) {
    this.productId = props.productId;
    this.quantity = props.quantity;
  }

  static fromPersistence(raw: {
    productId: string;
    quantity: number;
  }): CartItemEntity {
    return new CartItemEntity({
      productId: raw.productId,
      quantity: raw.quantity,
    });
  }
}
