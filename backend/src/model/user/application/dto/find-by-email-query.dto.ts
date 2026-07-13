import { IsEmail } from 'class-validator';

export class FindByEmailQueryDto {
  @IsEmail()
  email: string;
}
