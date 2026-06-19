import { CreateCategoryDto } from '@modules/category/application/dto/create-category.dto';
import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
