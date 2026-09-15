import { IsNotEmpty, IsString } from 'class-validator';

export class FindByNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
