// product.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.schema';
import { CreateProductDto, UpdateProductDto } from './dto/create.product.dto';
import { imageUploader } from '../../interceptor/image';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(imageUploader())
  @UsePipes(new ValidationPipe({ skipMissingProperties: false }))
  async create(
    @Body() data: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    await this.productService.create(data, files).then((product) => {
      if (files) {
        this.productService.saveFile(product.images, files);
      }
      return product;
    });
  }

  @Get()
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return this.productService.findAll(limit, offset);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Product> {
    return this.productService.delete(id);
  }
}
