import { Module } from '@nestjs/common';
import { UsersModule } from '../apis/users/users.module';
import { ProductModule } from '../apis/product/product.module';
import { OrderModule } from '../apis/order/order.module';
import { CategoriesModule } from '../apis/categories/categories.module';
import { TelegramInit } from './core/telegra.core';
import { TelegramHandlers } from './core/providers/telegram-general.handler';
import { TelegramProductHandler } from './core/providers/telegram-main.handler';
import { TelegramMenuService } from './core/providers/telegram-menu.handler';

@Module({
  imports: [UsersModule, ProductModule, OrderModule, CategoriesModule],
  providers: [
    TelegramInit,
    TelegramHandlers,
    TelegramProductHandler,
    TelegramMenuService,
  ],
  exports: [TelegramInit],
})
export class TelegramModule {}
