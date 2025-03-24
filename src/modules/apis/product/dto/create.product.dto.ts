import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsOptional()
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  description: string;

  @IsNumber()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attributes?: string[];

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  stock: number;
}
