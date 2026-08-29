import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateInspirationImageDto {
  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  alt?: string;
}
