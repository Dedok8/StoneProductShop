import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

import { UserRole } from '@/shared';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: USER, MANAGER, ADMIN' })
  role?: UserRole;
}
