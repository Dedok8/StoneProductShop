import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase, contain only letters, numbers and hyphens',
  })
  slug: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1_000_000)
  @Type(() => Number)
  price: number;

  @IsInt()
  @Min(0)
  @Max(1_000_000)
  @Type(() => Number)
  stock: number;

  @IsArray()
  @ArrayMaxSize(10)
  @IsUrl({}, { each: true })
  images: string[];

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  ownerId: string;
}
