export class InspirationImageResponseDto {
  readonly id: string;
  readonly imageUrl: string;
  readonly alt: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: {
    id: string;
    imageUrl: string;
    alt: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = props.id;
    this.imageUrl = props.imageUrl;
    this.alt = props.alt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
