import { Injectable, Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { TelegramProductService } from './providers/telegram-product.service';
import { TelegramMenuService } from './services/telegram-menu.service';
import { TelegramMessages } from '../helper/telegram.constants';
import {
  CallbackActionEnums,
  telegramActionType,
} from '../helper/telegram-actions';

@Injectable()
export class TelegramHandlers {
  private readonly logger = new Logger(TelegramHandlers.name);

  constructor(
    private readonly productService: TelegramProductService,
    private readonly menuService: TelegramMenuService,
  ) {}

  async handleStart(ctx: Context) {
    await this.menuService.handleMainMenu(ctx);
  }

  async handleBrowseProducts(ctx: Context) {
    await this.productService.handleShowProducts(10, 0, ctx);
  }

  async callBackQuery(ctx: Context) {
    try {
      const callbackData = JSON.parse(
        ctx.callbackQuery?.data,
      ) as telegramActionType;
      const { action, data } = callbackData;

      switch (action) {
        case CallbackActionEnums.ProductShowAll:
          return this.productService.handleShowProducts(
            data?.limit as number,
            data?.offset as number,
            ctx,
          );
        case CallbackActionEnums.AddToCart:
          return this.productService.handleAddToCart(data.productId, ctx);
        case CallbackActionEnums.AddToFavorites:
          return this.productService.handleAddToFavorites(data.productId, ctx);
        case CallbackActionEnums.ViewProduct:
          return this.productService.handleViewProduct(data.productId, ctx);
      }
    } catch (error) {
      this.logger.error('Callback query error:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }
}
