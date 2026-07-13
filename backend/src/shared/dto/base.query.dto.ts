import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '@/shared/dto/pagination.query.dto';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class BaseQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}
