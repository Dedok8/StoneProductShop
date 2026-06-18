import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'White Carrara Marble Slab' })
  @IsString()
  @MaxLength(200)
  @MinLength(2)
  readonly name: string;

  @ApiPropertyOptional({ example: 'Premium Italian marble, polished finish' })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiProperty({ example: 149.99 })
  @IsNumber()
  @Min(0)
  readonly price: number;

  @ApiPropertyOptional({ example: 10, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  readonly stock?: number;

  @ApiProperty({ example: 'a3f1c2e4-...' })
  @IsUUID()
  readonly typeId: string;

  @ApiPropertyOptional({ example: ['https://cdn.example.com/img1.jpg'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly images: string[];
}
