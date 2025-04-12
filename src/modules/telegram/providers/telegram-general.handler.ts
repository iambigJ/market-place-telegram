import { Injectable, Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';
import { ITelegramHandler } from '../interfaces/telegram.interface';

import { TelegramProductHandler } from './telegram-main.handler';
import { TelegramMenuService } from './telegram-menu.handler';
import { TelegramMessages } from '../helper/telegram.constants';
import {
  CallbackActionEnums,
  telegramActionType,
  TelegramActionData,
} from '../helper/telegram-actions';

@Injectable()
export class TelegramHandlers implements ITelegramHandler {
  private readonly logger = new Logger(TelegramHandlers.name);

  constructor(
    public readonly productService: TelegramProductHandler,
    private readonly menuService: TelegramMenuService,
  ) {}

  async handleStart(ctx: Context): Promise<void> {
    try {
      await ctx.reply(TelegramMessages.WELCOME_MAIN);
      await this.sendMainMenuKeyboard(ctx);
    } catch (error) {
      this.logger.error('Error in handleStart:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }

  async sendMainMenuKeyboard(ctx: Context): Promise<void> {
    try {
      await this.menuService.sendMainMenuKeyboard(ctx);
    } catch (error) {
      this.logger.error('Error in sendMainMenuKeyboard:', error);
      await ctx.reply(TelegramMessages.ERROR_MENU);
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

  async handleBuyerMenu(ctx: Context): Promise<void> {
    try {
      await this.menuService.sendBuyerMenuKeyboard(ctx);
    } catch (error) {
      this.logger.error('Error in handleBuyerMenu:', error);
      await ctx.reply(TelegramMessages.ERROR_MENU);
    }
  }

  async handleSellerMenu(ctx: Context): Promise<void> {
    try {
      await this.menuService.sendSellerMenuKeyboard(ctx);
    } catch (error) {
      this.logger.error('Error in handleSellerMenu:', error);
      await ctx.reply(TelegramMessages.ERROR_MENU);
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
      const { action, productId } = callbackData;

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
          await this.handleCancelAddToCart(ctx);
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

  async handleCancelAddToCart(ctx: Context): Promise<void> {
    try {
      await ctx.answerCbQuery('سفارش لغو شد');
      await ctx.reply('درخواست شما لغو شد.');
    } catch (error) {
      this.logger.error('Error in handleCancelAddToCart:', error);
      await ctx.reply(TelegramMessages.ERROR_GENERAL);
    }
  }
}

