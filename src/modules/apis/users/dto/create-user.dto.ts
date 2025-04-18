import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum userRole {
  Seller = 'Seller',
  Customer = 'Customer',
}
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  username: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsOptional()
  additionalInfo?: Map<string, string>;
}
