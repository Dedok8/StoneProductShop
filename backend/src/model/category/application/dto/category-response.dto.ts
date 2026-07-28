export class CategoryResponseDto {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly isActive: boolean;
  readonly createdAt: Date;

  constructor(props: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
  }
}
