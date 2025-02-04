// category.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    // parentId is optional; if provided it must be a valid MongoId.
    @IsOptional()
    @IsMongoId()
    parentId?: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}

export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsMongoId()
    parentId?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
