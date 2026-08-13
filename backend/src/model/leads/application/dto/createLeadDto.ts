import {
  IsBoolean,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsPhoneNumber()
  phone: string;

  @IsBoolean()
  @IsNotEmpty()
  consent: boolean;
}
