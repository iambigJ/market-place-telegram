import { Context } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export interface ITelegramHandler {
  handleStart(ctx: Context): Promise<void>;
  handleQuit(ctx: Context): Promise<void>;
  handleBuyerMenu(ctx: Context): Promise<void>;
  handleSellerMenu(ctx: Context): Promise<void>;
  handleTutorial(ctx: Context): Promise<void>;
  handleRules(ctx: Context): Promise<void>;
  notImplemented(ctx: Context): Promise<void>;
  sendMainMenuKeyboard(ctx: Context): Promise<void>;
  callBackQuery(ctx: Context): Promise<void>;
  handleProductAction(
    ctx: Context,
    productId: string,
    action: string,
  ): Promise<void>;
}

export interface ITelegramProductService {
  handleShowAllProducts(ctx: Context): Promise<void>;
  handleShowProducts(
    ctx: Context,
    limit?: number,
    offset?: number,
  ): Promise<void>;
  handleShowFullProduct(ctx: Context, productId: string): Promise<void>;
  handleAddToCart(ctx: Context, productId: string): Promise<void>;
  handleAddToFavorites(ctx: Context, productId: string): Promise<void>;
}

export interface ITelegramMenuService {
  sendMainMenuKeyboard(ctx: Context): Promise<void>;
  sendBuyerMenuKeyboard(ctx: Context): Promise<void>;
  sendSellerMenuKeyboard(ctx: Context): Promise<void>;
  ProductShowInline(productId: string): InlineKeyboardMarkup;
  sendProductPaginationButtoms(
    offset: number,
    limit: number,
    ctx: Context,
  ): Promise<void>;
}
