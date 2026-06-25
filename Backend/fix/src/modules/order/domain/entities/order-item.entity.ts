export class OrderItemEntity {
  readonly id: string;
  readonly quantity: number;
  readonly price: number ;
  readonly productId: string;
  readonly orderId: string;
  constructor(props: {
    id: string;
    quantity: number;
    price: number ;
    productId: string;
    orderId: string;
  }) {
    this.id = props.id;
    this.quantity = props.quantity;
    this.price = props.price;
    this.productId = props.productId;
    this.orderId = props.orderId;
  }

  get subTotal() {
    return this.quantity * this.price;
  }

  static fromPersistence(raw: {
    id: string;
    quantity: number;
    price: number;
    productId: string;
    orderId: string;
  }): OrderItemEntity {
    return new OrderItemEntity({
      ...raw,
      price: typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price,
    });
  }
}
