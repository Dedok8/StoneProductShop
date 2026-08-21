import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateInspirationImageDto {
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  alt?: string;
}
