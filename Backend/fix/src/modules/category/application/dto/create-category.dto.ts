import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Marble' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  readonly name: string;

  @ApiPropertyOptional({ example: 'Natural marble tiles and slabs' })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiPropertyOptional({ example: 'a3f1c2e4-...' })
  @IsUUID()
  @IsOptional()
  readonly parentId?: string;
}
