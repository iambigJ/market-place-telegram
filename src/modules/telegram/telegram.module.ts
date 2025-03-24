import { Module } from '@nestjs/common';
import { TelegramInit } from './init';
import { UsersModule } from '../apis/users/users.module';
import { ProductModule } from '../apis/product/product.module';

@Module({
  imports: [UsersModule, ProductModule],
  providers: [TelegramInit],
})
export class TelegramModule {}
