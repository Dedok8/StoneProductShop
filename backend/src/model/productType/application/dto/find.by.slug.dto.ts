import { IsNotEmpty, IsString } from 'class-validator';

export class FindBySlugDto {
  @IsString()
  @IsNotEmpty()
  slug: string;
}
