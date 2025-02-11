import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './category.schema';
import { UpdateCategoriesDto } from './dto/categories.update.dto';
import { CreateCategoryDto } from './dto/categories.create.dto'; // Assuming category.schema.ts is in the same directory

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(category: CreateCategoryDto) {
    const createdCategory = new this.categoryModel(category);
    return await createdCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryModel.find().exec();
  }

  async findById(id: string): Promise<Category | null> {
    return await this.categoryModel.findById(id).exec();
  }

  async update(
    id: string,
    category: UpdateCategoriesDto,
  ): Promise<Category | null> {
    return await this.categoryModel
      .findByIdAndUpdate(id, category, { new: true })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
