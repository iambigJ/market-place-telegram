import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDate,
  IsArray,
  IsMap,
  ArrayNotEmpty,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()

  role: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  createdAt?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  updatedAt?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  deletedAt?: Date;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsString()
  @IsOptional()
  address?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsOptional()
  favoriteCategories?: string[];

  @IsMap()
  @IsOptional()
  additionalInfo?: Map<string, string>;
}
