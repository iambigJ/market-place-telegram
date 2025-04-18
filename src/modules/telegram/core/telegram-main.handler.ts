import { Injectable, Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { TelegramProductHandler } from '../handlers/telegram-seller.handler';
import { TelegramMenuService } from '../handlers/telegram-menu.handler';
import { TelegramMessages } from '../helper/telegram.constants';
import {
  CallbackActionEnums,
  TelegramActionData,
} from '../helper/telegram-actions';

@Injectable()
export class TelegramHandlers {
  private readonly logger = new Logger(TelegramHandlers.name);

  constructor(
    public readonly productService: TelegramProductHandler,
    private readonly menuService: TelegramMenuService,
  ) {}

  async handleStart(ctx: Context): Promise<void> {
    try {
      await ctx.reply(TelegramMessages.WELCOME_MAIN);
      await this.menuService.sendMainMenuKeyboard(ctx);
    } catch (error) {
      this.logger.error('Error in handleStart:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }

  async handleQuit(ctx: Context): Promise<void> {
    try {
      await ctx.reply(TelegramMessages.NOT_IMPLEMENTED);
    } catch (error) {
      this.logger.error('Error in handleQuit:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }

  async handleTutorial(ctx: Context): Promise<void> {
    try {
      await ctx.reply(TelegramMessages.NOT_IMPLEMENTED);
    } catch (error) {
      this.logger.error('Error in handleTutorial:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }

  async handleRules(ctx: Context): Promise<void> {
    try {
      await ctx.reply(TelegramMessages.NOT_IMPLEMENTED);
    } catch (error) {
      this.logger.error('Error in handleRules:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }

  async notImplemented(ctx: Context): Promise<void> {
    try {
      await ctx.reply(TelegramMessages.NOT_IMPLEMENTED);
    } catch (error) {
      this.logger.error('Error in notImplemented:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }

  async callBackQuery(ctx: Context): Promise<void> {
    try {
      if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) {
        return;
      }

      const data = ctx.callbackQuery.data;
      if (!data) {
        throw new Error('No callback query data found');
      }

      const callbackData = JSON.parse(data) as TelegramActionData;
      const { action, productId, orderId, categoryId, limit, offset } =
        callbackData;

      if (
        action === 'go_to_page' &&
        typeof limit === 'number' &&
        typeof offset === 'number'
      ) {
        await ctx.answerCbQuery();

        await this.productService.handleShowProducts(ctx, limit, offset);
        return;
      }

      if (action === CallbackActionEnums.CancelOrder && orderId) {
        await this.productService.handleCancelOrder(ctx, orderId);
        return;
      }

      // Handle show products by category
      if (action === CallbackActionEnums.ShowProductsByCategory && categoryId) {
        await this.productService.handleShowProductsByCategory(ctx, categoryId);
        return;
      }

      await this.handleProductAction(ctx, productId, action);
    } catch (error) {
      this.logger.error('Error in callBackQuery:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }

  async handleProductAction(
    ctx: Context,
    productId: number,
    action: string,
  ): Promise<void> {
    try {
      switch (action) {
        case CallbackActionEnums.RemoveFromFavorites:
          await this.productService.handleRemoveFromFavorites(ctx, productId);
          break;
        case CallbackActionEnums.ViewProduct:
          await this.productService.handleShowFullProduct(ctx, productId);
          break;
        case CallbackActionEnums.AddToCart:
          await this.productService.handleAddToCart(ctx, productId);
          break;
        case CallbackActionEnums.AddToCartConfirm:
          await this.productService.handleAddToCartConfirm(ctx, productId);
          break;
        case CallbackActionEnums.AddToCartConfirmCancel:
          await this.productService.handleCancelAddToCart(ctx);
          break;
        case CallbackActionEnums.AddToFavorites:
          await this.productService.handleAddToFavorites(ctx, productId);
          break;
        default:
          this.logger.warn(`Unhandled product action: ${action}`);
          await this.notImplemented(ctx);
      }
    } catch (error) {
      this.logger.error('Error in handleProductAction:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }
}
