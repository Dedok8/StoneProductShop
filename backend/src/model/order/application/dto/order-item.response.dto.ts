export class OrderItemResponse {
  readonly id: string;
  readonly productId: string;
  readonly quantity: number;
  readonly price: number;
  readonly subTotal: number;

  constructor(props: {
    id: string;
    productId: string;
    quantity: number;
    price: number | string;
  }) {
    this.id = props.id;
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.price = Number(props.price);
    this.subTotal = this.quantity * this.price;
  }
}
