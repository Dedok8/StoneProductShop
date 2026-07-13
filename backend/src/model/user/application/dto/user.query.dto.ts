import { IsEnum, IsOptional } from 'class-validator';

import { BaseQueryDto } from '@/shared';

export enum UserSortBy {
  NAME = 'name',
  EMAIL = 'email',
  CREATED_AT = 'createdAt',
}


export class UserQueryDto extends BaseQueryDto {
  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy?: UserSortBy = UserSortBy.CREATED_AT;
}
