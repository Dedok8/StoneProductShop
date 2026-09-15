import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProductColorDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsHexColor()
  hex?: string | null;
}
