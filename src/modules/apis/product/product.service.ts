// product.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { Product, ProductDocument } from './product.schema';
import { CreateProductDto } from './dto/create.product.dto';
import { MyLogger } from '../../../common/custom-logger/custom-logger';
import fs from 'fs';
import path from 'node:path';
import { UpdateProductDto } from './dto/update.product.dto';
import { Types } from 'mongoose';
import mongoose from 'mongoose';
import { CategoryService } from '../categories/categoy.service';

@Injectable()
export class ProductService {
  private logger = new MyLogger(ProductService.name);
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryService: CategoryService,
  ) {}

  async saveFile(filesPath: string[], filesData: Array<Express.Multer.File>) {
    const promises = filesPath.map((path, i) => {
      return new Promise<void>((resolve, reject) => {
        const stream = fs.createWriteStream(path);
        stream.write(filesData[i].buffer);
        stream.end();
        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
      });
    });
    await Promise.all(promises).catch((e) => {
      this.logger.error('error saving file', e);
      throw new InternalServerErrorException('Error saving file');
    });
  }

  generateFileName(fileName: string) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileLastName = `${uniqueSuffix}-${fileName}`;
    const uploadPath = path.join(__dirname, '../../../../storage');
    return { path: path.join(uploadPath, fileLastName), name: fileLastName };
  }

  async create(
    telegramIdOwner: string,
    createProductDto: CreateProductDto & {
      images: Array<string>;
    },
    files: Array<Express.Multer.File>,
  ): Promise<Product & { pathes: string[] }> {
    const fileNames: string[] = [];
    const filePathes: string[] = [];
    if (files) {
      for (const file of files) {
        const { path, name } = this.generateFileName(file.originalname);
        fileNames.push(name);
        filePathes.push(path);
      }
    }
    createProductDto.images = fileNames;
    createProductDto.ownerId = telegramIdOwner;
    const products = await this.productRepository.create(createProductDto);
    const result = { ...products, pathes: filePathes };
    return result;
  }

  async findAll(limit = 10, offset = 10): Promise<ProductDocument[]> {
    this.logger.log('Fetching all products');
    return this.productRepository.findAll(limit, offset).catch((e) => {
      this.logger.error('error getting product', e);
      throw new NotFoundException('Error getting products');
    });
  }

  async countAll(): Promise<number> {
    try {
      this.logger.log('Counting all products');
      return this.productRepository.productModel.countDocuments({}).exec();
    } catch (e) {
      this.logger.error('Error counting products', e);
      throw new NotFoundException('Error counting products');
    }
  }

  async countByCategory(categoryId: string | Types.ObjectId): Promise<number> {
    try {
      this.logger.log(`Counting products for category ${categoryId}`);
      return this.productRepository.productModel
        .countDocuments({ categoryId })
        .exec();
    } catch (e) {
      this.logger.error('Error counting products by category', e);
      throw new NotFoundException('Error counting products by category');
    }
  }

  async findOne(id: number | Types.ObjectId): Promise<ProductDocument> {
    const product = await this.productRepository.findOne(id);
    if (!product) {
      this.logger.warn(`Product with id ${id} not found`);
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.find(id);
    if (!product) {
      throw new UnprocessableEntityException('product not found');
    }
    const updatedProduct = await this.productRepository.update(
      id,
      updateProductDto,
    );
    if (!updatedProduct) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return updatedProduct;
  }

  async delete(id: string): Promise<Product> {
    const deletedProduct = await this.productRepository.delete(id);
    if (!deletedProduct) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return deletedProduct;
  }

  async findByCategory(
    categoryId: string | Types.ObjectId,
    limit = 10,
    offset = 0,
  ): Promise<ProductDocument[]> {
    this.logger.log(`Fetching products for category ${categoryId}`);
    return this.productRepository
      .findByCategory(categoryId, limit, offset)
      .catch((e) => {
        this.logger.error('Error getting products by category', e);
        throw new NotFoundException('Error getting products by category');
      });
  }

  /**
   * Search products by name
   * @param query Search query string
   * @returns Array of products matching the query
   */
  async searchByName(query: string): Promise<ProductDocument[]> {
    this.logger.log(`Searching products by name: ${query}`);
    try {
      // Create case-insensitive regex search
      const regex = new RegExp(query, 'i');
      return this.productRepository.findByRegex({ name: regex }, 20, 0);
    } catch (error) {
      this.logger.error('Error searching products by name:', error);
      throw new NotFoundException('Error searching products');
    }
  }

  /**
   * Advanced search for products with multiple criteria
   * @param name Optional product name to search
   * @param category Optional category name or ID
   * @param minPrice Optional minimum price
   * @param maxPrice Optional maximum price
   * @returns Array of products matching the criteria
   */
  async advancedSearch(
    name?: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<ProductDocument[]> {
    this.logger.log(
      `Advanced search - Name: ${name}, Category: ${category}, Price: ${minPrice}-${maxPrice}`,
    );

    try {
      // Build search criteria
      const searchCriteria: any = {};

      if (name) {
        searchCriteria.name = new RegExp(name, 'i');
      }

      if (category) {
        // Try to find category by name first
        try {
          //@ts-ignore
          const categoryDoc = await this.categoryService.findByName(category);
          if (categoryDoc) {
            searchCriteria.categoryId = categoryDoc._id;
          }
        } catch (e) {
          // If not found, check if it's a valid categoryId
          try {
            if (mongoose.Types.ObjectId.isValid(category)) {
              searchCriteria.categoryId = new mongoose.Types.ObjectId(category);
            }
          } catch (error) {
            // Ignore and continue without category filter
          }
        }
      }

      // Add price range if specified
      if (minPrice !== undefined || maxPrice !== undefined) {
        searchCriteria.price = {};
        if (minPrice !== undefined) {
          searchCriteria.price.$gte = minPrice;
        }
        if (maxPrice !== undefined) {
          searchCriteria.price.$lte = maxPrice;
        }
      }

      return this.productRepository.findByAdvancedCriteria(
        searchCriteria,
        20,
        0,
      );
    } catch (error) {
      this.logger.error('Error in advanced search:', error);
      throw new NotFoundException('Error performing advanced search');
    }
  }
}
