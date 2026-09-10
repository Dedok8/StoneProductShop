import { IsNotEmpty, IsString } from 'class-validator';

export class SearchUserDto {
  @IsNotEmpty()
  @IsString()
  query: string;
}
