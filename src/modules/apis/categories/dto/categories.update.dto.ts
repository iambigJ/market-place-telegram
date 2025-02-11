import { CreateCategoryDto } from './categories.create.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateCategoriesDto extends PartialType(CreateCategoryDto) {}
