import { IsOptional, IsString, IsUrl, Max } from 'class-validator';

export class ProductImageInputDto {
  @IsUrl({ require_tld: false })
  url: string;

  @IsOptional()
  @IsString()
  @Max(50)
  alt: string;
}
