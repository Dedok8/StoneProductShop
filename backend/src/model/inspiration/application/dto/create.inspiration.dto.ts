import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateInspirationImageDto {
  @IsUrl({ require_tld: false })
  imageUrl: string;

  @IsOptional()
  @IsString()
  alt?: string;
}
