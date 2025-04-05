import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';
import {
  getConnectionToken,
  InjectConnection,
  MongooseModule,
} from '@nestjs/mongoose';
import { setupProductSchemaAutoIncrement, Product } from './product.schema';
import { UsersModule } from '../users/users.module';
import { Connection } from 'mongoose';


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Product.name,
        useFactory: (connection: Connection) => {
          return setupProductSchemaAutoIncrement(connection);
        },
        inject: [getConnectionToken()],
      },
    ]),
    UsersModule,
  ],
  controllers: [ProductController],
  providers: [ProductRepository, ProductService],
  exports: [ProductService],
})
export class ProductModule {}
