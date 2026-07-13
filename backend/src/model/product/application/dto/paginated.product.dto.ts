import type { ProductResponseDto } from '@/model/product/application/dto/product.response.dto';
import type { PaginationMetaDto } from '@/shared';

export class PaginatedProductResponseDto {
  readonly items: ProductResponseDto[];

  readonly meta: PaginationMetaDto;

  constructor(props: { items: ProductResponseDto[]; meta: PaginationMetaDto }) {
    this.items = props.items;
    this.meta = props.meta;
  }
}
