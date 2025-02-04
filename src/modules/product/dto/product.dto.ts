// product.dto.ts
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
    @IsMongoId()
    @IsNotEmpty()
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

    // categoryId is optional; if provided it must be a valid MongoId.
    @IsOptional()
    @IsMongoId()
    categoryId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attributes?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsNumber()
    @Type(() => Number)
    stock: number;
}

export class UpdateProductDto {
    @IsOptional()
    @IsMongoId()
    ownerId?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(32)
    description?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    price?: number;

    @IsOptional()
    @IsMongoId()
    categoryId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attributes?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    stock?: number;
}
