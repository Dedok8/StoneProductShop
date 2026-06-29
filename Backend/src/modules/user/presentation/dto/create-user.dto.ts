import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  @MinLength(2)
  readonly name: string;

  @IsArray()
  @IsOptional()
  readonly images?: string[];
}
