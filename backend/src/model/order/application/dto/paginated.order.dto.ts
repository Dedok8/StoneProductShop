import type { OrderResponse } from '@/model/order/application/dto';
import type { PaginationMetaDto } from '@/shared';

export class PaginatedOrderResponseDto {
  readonly items: OrderResponse[];
  readonly meta: PaginationMetaDto;
  constructor(props: { items: OrderResponse[]; meta: PaginationMetaDto }) {
    this.items = props.items;
    this.meta = props.meta;
  }
}
