import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './category.schema';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './categoy.service';
import { CategoryController } from './category.controller';
import { Product, ProductSchema } from '../product/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryRepository, CategoryService],
})
export class CategoriesModule {}
