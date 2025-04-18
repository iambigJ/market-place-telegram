import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create.product.dto';
import { UpdateProductDto } from './dto/update.product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name) public productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    return this.productModel.create(createProductDto);
  }

  async findAll(limit: number, offset: number): Promise<ProductDocument[]> {
    return this.productModel.find({}, {}, { limit, offset }).exec();
  }

  async findOne(id: number | Types.ObjectId): Promise<ProductDocument> {
    return this.productModel.findById(id).exec();
  }

  async find(id: string) {
    return this.productModel.findOne({ telegramId: id });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productModel
      .findOneAndUpdate({ telegramId: id }, updateProductDto, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Product> {
    return this.productModel.findByIdAndDelete(id).exec();
  }

  async findByCategory(
    categoryId: string | Types.ObjectId,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ProductDocument[]> {
    return this.productModel.find({ categoryId }, {}, { limit, offset }).exec();
  }

  /**
   * Find products by regex pattern
   * @param pattern Object with field names and regex patterns
   * @param limit Maximum number of results
   * @param offset Pagination offset
   * @returns Array of matching products
   */
  async findByRegex(pattern: Record<string, RegExp>, limit: number, offset: number): Promise<ProductDocument[]> {
    return this.productModel.find(pattern, {}, { limit, skip: offset }).exec();
  }

  /**
   * Find products with advanced search criteria
   * @param criteria Search criteria object
   * @param limit Maximum number of results
   * @param offset Pagination offset
   * @returns Array of matching products
   */
  async findByAdvancedCriteria(criteria: Record<string, any>, limit: number, offset: number): Promise<ProductDocument[]> {
    return this.productModel.find(criteria, {}, { limit, skip: offset }).exec();
  }
}
