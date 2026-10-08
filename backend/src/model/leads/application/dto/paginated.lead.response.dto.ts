import type { LeadResponseDto } from '@/model/leads/application/dto/lead.response.dto';
import type { PaginationMetaDto } from '@/shared';

export class PaginatedLeadResponseDto {
  readonly items: LeadResponseDto[];
  readonly meta: PaginationMetaDto;

  constructor(props: { items: LeadResponseDto[]; meta: PaginationMetaDto }) {
    this.items = props.items;
    this.meta = props.meta;
  }
}
