import Context from 'telegraf/typings/context';
import { CallbackActionEnums } from '../../helper/telegram-actions';
import {
  TelegramMessages,
  TelegramProductActions,
  TelegramProductButtons,
} from '../../helper/telegram.constants';
import { Markup } from 'telegraf';

export class TelegramActionsMenu {
  static async handlerNextPreviousPage(
    limit: number,
    offset: number,
    ctx: Context,
  ) {
    await ctx.reply(
      TelegramMessages.ProductMovingPages,
      Markup.inlineKeyboard([
        Markup.button.callback(
          'صفحه بعد ⬅️',
          this.showProductsNextPage(limit, offset),
        ),
        Markup.button.callback(
          'صفحه قبل ➡️',
          this.showProductpreviousPage(limit, offset),
        ),
      ]),
    );
  }

  static showProductsNextPage(limit: number, offset: number) {
    return JSON.stringify({
      action: CallbackActionEnums.ProductShowAll,
      data: { limit, offset: offset + limit },
    });
  }

  static showProductpreviousPage(limit: number, offset: number) {
    offset = Math.max(0, offset - limit);
    return JSON.stringify({
      action: CallbackActionEnums.ProductShowAll,
      data: { limit, offset: offset },
    });
  }

  static createProductShowKeyboard(productId: string) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          TelegramProductButtons.ADD_TO_CART,
          `${TelegramProductActions.ADD_TO_CART}${productId}`,
        ),
        Markup.button.callback(
          TelegramProductButtons.ADD_TO_FAVORITES,
          `${TelegramProductActions.ADD_TO_FAVORITES}${productId}`,
        ),
      ],
      [
        Markup.button.callback(
          TelegramProductButtons.VIEW_PRODUCT,
          `${TelegramProductActions.VIEW_PRODUCT}${productId}`,
        ),
      ],
    ]);
  }
}
