import { Injectable, Logger } from '@nestjs/common';
import { Context } from 'telegraf';
import { CallbackQuery } from 'telegraf/typings/core/types/typegram';

import { TelegramProductService } from './providers/telegram-product.service';
import { TelegramMenuService } from './providers/telegram-menu.service';
import { TelegramMessages } from '../helper/telegram.constants';
import {
  CallbackActionEnums,
  telegramActionType,
} from '../helper/telegram-actions';

@Injectable()
export class TelegramHandlers {
  private readonly logger = new Logger(TelegramHandlers.name);

  constructor(
    public readonly productService: TelegramProductService,
    private readonly menuService: TelegramMenuService,
  ) {}

  async handleStart(ctx: Context) {
    try {
      await this.menuService.handleMainMenu(ctx);
    } catch (error) {
      this.logger.error('Error in handleStart:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }

  async callBackQuery(ctx: Context) {
    try {
      if (!ctx.callbackQuery) {
        throw new Error('No callback query found');
      }

      const query = ctx.callbackQuery;
      const data = query?.data as any;

      if (!data) {
        throw new Error('No callback query data found');
      }

      const callbackData = JSON.parse(data) as telegramActionType;
      const { action, data: actionData } = callbackData;

      await ctx.answerCbQuery();

      switch (action) {
        case CallbackActionEnums.ProductShowAll:
          await this.productService.handleShowAllProducts(
            ctx,
            actionData?.limit ?? 10,
            actionData?.offset ?? 0,
          );
          break;

          case: CallbackActionEnums.ProductFullView:
          await this.productService.
        default:
          this.logger.warn(`Unhandled callback action: ${action}`);
          await this.notImplemented(ctx);
      }
    } catch (error) {
      this.logger.error('Callback query error:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }

  async notImplemented(ctx: Context) {
    try {
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery();
      }
      await ctx.reply(
        TelegramMessages.NOT_IMPLEMENTED ?? 'Not implemented yet',
      );
    } catch (error) {
      this.logger.error('Error in notImplemented handler:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }

  async handleQuit(ctx: Context) {
    try {
      await this.notImplemented(ctx);
    } catch (error) {
      this.logger.error('Error in handleQuit:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }

  async handleBuyerMenu(ctx: Context) {
    try {
      await this.menuService.handleBuyerMenu(ctx);
    } catch (error) {
      this.logger.error('Error in handleBuyerMenu:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }

  async handleSellerMenu(ctx: Context) {
    try {
      await this.notImplemented(ctx);
    } catch (error) {
      this.logger.error('Error in handleSellerMenu:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }

  async handleTutorial(ctx: Context) {
    try {
      await this.notImplemented(ctx);
    } catch (error) {
      this.logger.error('Error in handleTutorial:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }

  async handleRules(ctx: Context) {
    try {
      await this.notImplemented(ctx);
    } catch (error) {
      this.logger.error('Error in handleRules:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }

  async sendMainMenuKeyboard(ctx: Context) {
    try {
      await this.menuService.handleMainMenu(ctx);
    } catch (error) {
      this.logger.error('Error in sendMainMenuKeyboard:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }
}
