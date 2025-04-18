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
  UseGuards,
  Req,
  BadRequestException,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.schema';
import { CreateProductDto } from './dto/create.product.dto';
import { imageUploader } from '../../../common/interceptor/image';
import { UpdateProductDto } from './dto/update.product.dto';
import {
  AuthGuard,
  RequestWithUser,
} from '../../../common/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly userService: UsersService,
    private readonly productService: ProductService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(imageUploader())
  @UsePipes(new ValidationPipe({ skipMissingProperties: false }))
  @UseGuards(AuthGuard)
  async create(
    @Body() data: CreateProductDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: RequestWithUser,
  ) {
    if (!files || !files.length) {
      throw new BadRequestException('at least one file exepted');
    }
    if (req.user?.productLimit <= 0)
      throw new UnauthorizedException('product limit exceeded');
    return await this.productService
      .create(req.user?.teleId as string, data as any, files)
      .then(async (product) => {
        await this.userService.updateProductLimit(req.user?.teleId);
        await this.productService.saveFile(product.pathes, files);
      });
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return this.productService.findAll(limit, offset);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Put()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Req() req: RequestWithUser,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.update(req?.user?.teleId, updateProductDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Product> {
    return this.productService.delete(id);
  }
}
