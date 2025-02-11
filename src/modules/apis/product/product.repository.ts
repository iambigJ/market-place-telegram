import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from './product.schema';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create.product.dto';
import { UpdateProductDto } from './dto/update.product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.productModel.create(createProductDto);
  }

  async findAll(limit: number, offset: number): Promise<Product[]> {
    return this.productModel.find({ limit, offset }).exec();
  }

  async findOne(id: string): Promise<Product> {
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
}
