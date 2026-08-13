import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';

import { LeadStatus } from '@/generated/prisma';
import { PaginationQueryDto, SortOrder } from '@/shared';

export class LeadQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;
}
