// category.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { Category } from './category.schema';
import { CreateCategoryDto } from './dto/categories.create.dto';
import { UpdateCategoriesDto } from './dto/categories.update.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.categoryRepository.create(createCategoryDto);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoriesDto,
  ): Promise<Category> {
    const updatedCategory = await this.categoryRepository.update(
      id,
      updateCategoryDto,
    );
    if (!updatedCategory) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return updatedCategory;
  }

  async delete(id: string) {
    const deletedCategory = await this.categoryRepository.delete(id);
    if (!deletedCategory) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return deletedCategory;
  }
}
