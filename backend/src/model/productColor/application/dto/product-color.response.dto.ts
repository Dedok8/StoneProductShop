export class ProductColorResponseDto {
  readonly id: string;
  readonly name: string;
  readonly hex: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  constructor(props: {
    id: string;
    name: string;
    hex: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.hex = props.hex;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
