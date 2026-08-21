import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateInspirationImageDto {
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  alt?: string;
}
