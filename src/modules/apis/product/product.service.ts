// product.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create.product.dto';
import { MyLogger } from '../../../common/custom-logger/custom-logger';
import fs from 'fs';
import path from 'node:path';
import { UpdateProductDto } from './dto/update.product.dto';

@Injectable()
export class ProductService {
  private logger = new MyLogger(ProductService.name);
  constructor(private readonly productRepository: ProductRepository) {}

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
    const extension = path.extname(fileName) || '.png';
    const fileLastName = `${uniqueSuffix}-${fileName}${extension}`;
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

  async findAll(limit = 10, offset = 10) {
    this.logger.log('Fetching all products');
    return this.productRepository.findAll(limit, offset).catch((e) => {
      this.logger.error('error getting product', e);
      throw new NotFoundException('Error getting products');
    });
  }

  async findOne(id: string): Promise<Product> {
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
}
