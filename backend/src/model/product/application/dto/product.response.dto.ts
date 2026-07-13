export class ProductResponseDto {
  readonly id: string;

  readonly name: string;

  readonly slug: string;

  readonly description: string;

  readonly price: number;

  readonly stock: number;

  readonly images: string[];

  readonly categoryId: string;

  constructor(props: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    categoryId: string;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.description = props.description;
    this.price = props.price;
    this.stock = props.stock;
    this.images = props.images;
    this.categoryId = props.categoryId;
  }
}
