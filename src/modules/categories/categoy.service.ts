// // category.service.ts
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CategoryRepository } from './category.repository';
// import { Category } from './category.schema';
// import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
//
// @Injectable()
// export class CategoryService {
//   constructor(private readonly categoryRepository: CategoryRepository) {}
//
//   async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
//     return this.categoryRepository.create(createCategoryDto);
//   }
//
//   async findAll(): Promise<Category[]> {
//     return this.categoryRepository.findAll();
//   }
//
//   async findOne(id: string): Promise<Category> {
//     const category = await this.categoryRepository.findOne(id);
//     if (!category) {
//       throw new NotFoundException(`Category with id ${id} not found`);
//     }
//     return category;
//   }
//
//   async update(
//     id: string,
//     updateCategoryDto: UpdateCategoryDto,
//   ): Promise<Category> {
//     const updatedCategory = await this.categoryRepository.update(
//       id,
//       updateCategoryDto,
//     );
//     if (!updatedCategory) {
//       throw new NotFoundException(`Category with id ${id} not found`);
//     }
//     return updatedCategory;
//   }
//
//   async delete(id: string): Promise<Category> {
//     const deletedCategory = await this.categoryRepository.delete(id);
//     if (!deletedCategory) {
//       throw new NotFoundException(`Category with id ${id} not found`);
//     }
//     return deletedCategory;
//   }
// }
