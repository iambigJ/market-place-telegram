import { Module } from '@nestjs/common';
import { TelegramInit } from './core/telegra.core';

import { UsersModule } from '../apis/users/users.module';
import { ProductModule } from '../apis/product/product.module';
import { OrderModule } from '../apis/order/order.module';
import { CategoriesModule } from '../apis/categories/categories.module';
import { TelegramHandlers } from './core/telegram-handlers';
import { TelegramProductService } from './core/providers/telegram-product.service';
import { TelegramMenuService } from './core/services/telegram-menu.service';

@Module({
  imports: [UsersModule, ProductModule, OrderModule, CategoriesModule],
  providers: [
    TelegramInit,
    TelegramHandlers,
    TelegramProductService,
    TelegramMenuService,
  ],
})
export class TelegramModule {}
