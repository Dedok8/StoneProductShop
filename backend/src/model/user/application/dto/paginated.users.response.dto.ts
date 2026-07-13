import type { UserResponseDto } from '@/model/user/application/dto/user-response.dto';
import type { PaginationMetaDto } from '@/shared';

export class PaginatedUsersResponseDto {
  readonly items: UserResponseDto[];

  readonly meta: PaginationMetaDto;

  constructor(props: { items: UserResponseDto[]; meta: PaginationMetaDto }) {
    this.items = props.items;
    this.meta = props.meta;
  }
}
