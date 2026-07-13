import { IsEnum, IsOptional, IsString } from 'class-validator';

import { BaseQueryDto } from '@/shared';

export enum ProductSortBy {
  NAME = 'name',
  PRICE = 'price',
  CREATED_AT = 'createdAt',
}


export class ProductQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.CREATED_AT;

  @IsOptional()
  @IsString()
  categoryId?: string;
}
