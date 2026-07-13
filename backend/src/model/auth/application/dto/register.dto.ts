
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,

} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;


  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(64, { message: 'Password must be at most 64 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  password: string;
}
