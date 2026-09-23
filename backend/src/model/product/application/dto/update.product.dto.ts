import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { ProductImageInputDto } from '@/model/product/application/dto/product.image.input.dto';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase, contain only letters, numbers and hyphens',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1_000_000)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  @Type(() => Number)
  stock?: number;

  @ValidateNested({ each: true })
  @Type(() => ProductImageInputDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsOptional()
  images: ProductImageInputDto[];

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  productTypeId?: string;

  @IsOptional()
  @IsUUID()
  originId?: string;

  @IsOptional()
  @IsUUID()
  colorId?: string;
}
