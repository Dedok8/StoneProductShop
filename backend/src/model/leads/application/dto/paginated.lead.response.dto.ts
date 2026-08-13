import type { LeadResponse } from '@/model/leads/application/dto/lead.response';
import type { PaginationMetaDto } from '@/shared';

export class PaginatedLeadResponseDto {
  readonly items: LeadResponse[];
  readonly meta: PaginationMetaDto;

  constructor(props: { items: LeadResponse[]; meta: PaginationMetaDto }) {
    this.items = props.items;
    this.meta = props.meta;
  }
}
