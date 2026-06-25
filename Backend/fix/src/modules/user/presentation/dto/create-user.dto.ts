import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  @MinLength(2)
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsNumber()
  @Min(0)
  readonly price: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  readonly stock?: number;

  @IsUUID()
  readonly categoryId: string;

  @IsArray()
  @IsOptional()
  readonly images?: string[];
}
