import type { OrderResponseDto } from '@/model/order/infrastructure';
import type { PaginationMetaDto } from '@/shared';

export class PaginatedOrderResponseDto {
  readonly items: OrderResponseDto[];

  readonly meta: PaginationMetaDto;

  constructor(props: { items: OrderResponseDto[]; meta: PaginationMetaDto }) {
    this.items = props.items;
    this.meta = props.meta;
  }
}
