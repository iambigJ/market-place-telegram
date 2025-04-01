import { Context, Markup } from 'telegraf';
import { Logger } from '@nestjs/common';
import { ProductService } from '../../apis/product/product.service';
import {
  TelegramMessages,
  TelegramCommands,
  TelegramKeyboards,
  TelegramHears,
} from '../helper/telegram.constants';
import { ConfigService } from '@nestjs/config';
import {
  Product,
  ProductDocument,
} from 'src/modules/apis/product/product.schema';
import { CallbackActionEnums } from '../helper/telegram-actions';

export class TelegramHandlers {
  private prefixImagePath: string;
  private defaultImagePath: string;
  constructor(
    private productService: ProductService,
    private logger: Logger,
    private config: ConfigService,
  ) {
    const ip = this.config.get<string>('host_ip');
    this.prefixImagePath = `http://${ip}/storage`;
    this.defaultImagePath = `${this.prefixImagePath}/${this.config.get('host_defaultImage')}`;
  }

  async handleQueries(ctx: Context) {}
  async handleShowProduct(ctx: Context) {
    await ctx.reply('Please enter the product ID:', Markup.forceReply());
  }

  async sendMainMenuKeyboard(ctx: Context) {
    try {
      await ctx.reply(
        TelegramMessages.WELCOME_MAIN,
        Markup.keyboard(TelegramKeyboards.MAIN_MENU).oneTime(false).resize(),
      );
    } catch (error) {
      this.logger.error('Error sending main menu keyboard:', error);
    }
  }

  async handleStart(ctx: Context) {
    await this.sendMainMenuKeyboard(ctx);
  }

  async notImplemented(ctx: Context) {
    await ctx.reply(TelegramMessages.NOT_IMPLEMENTED);
  }

  async handleQuit(ctx: Context) {
    try {
      if ('message' in ctx && 'chat' in ctx.message) {
        await ctx.telegram.leaveChat(ctx.message.chat.id);
        await ctx.leaveChat();
      }
    } catch (error) {
      this.logger.error('Error handling quit command:', error);
    }
  }

  async handleSellerMenu(ctx: Context) {
    try {
      await ctx.reply(
        TelegramMessages.WELCOME_SELLER,
        Markup.keyboard(TelegramKeyboards.SELLER_MENU).resize().oneTime(false),
      );
    } catch (error) {
      this.logger.error('Error sending main menu keyboard:', error);
      await ctx.reply(TelegramMessages.ERROR_MENU);
    }
  }

  async handleBuyerMenu(ctx: Context) {
    await ctx.reply(TelegramMessages.BUYER_MENU_NOT_READY);
  }

  async handleTutorial(ctx: Context) {
    await ctx.reply(TelegramHears.TUTORIAL);
  }

  async handleRules(ctx: Context) {
    await ctx.reply(TelegramHears.RULES);
  }

  private escapeMarkdownV2(text: string): string | number {
    let stringValue = text;
    if (typeof text == 'number') {
      stringValue = String(text);
    }

    return stringValue.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }

  private formatProductCaption(product: Product): string {
    const escapedName = this.escapeMarkdownV2(product.name);
    const escapedPrice = this.escapeMarkdownV2(product.price as any);
    const escapedDescrimagepathtion = this.escapeMarkdownV2(
      product.description,
    );

    return `
📦 *${escapedName}*
💰 قیمت: ${escapedPrice} تومان
📝 توضیحات: ${escapedDescrimagepathtion}
  `;
  }

  private createProductShowKeyboard(product: any) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback(
          '🛒 افزودن به سبد خرید',
          `add_to_cart_${String(product._id)}`,
        ),
        Markup.button.callback(
          '❤️ افزودن به علاقه‌مندی‌ها',
          `add_to_favorites_${String(product._id)}`,
        ),
      ],
      [
        Markup.button.callback(
          'مشاهده کامل محصول با مشخصات',
          `view_product_${String(product._id)}`,
        ),
      ],
    ]);
  }

  private async fetchProductBatch(
    limit: number,
    offset: number,
    ctx: Context, // Keep context for potential error replies
  ): Promise<ProductDocument[] | null> {
    try {
      this.logger.log(
        `Workspaceing products: limit=${limit}, offset=${offset}`,
      );
      const products: ProductDocument[] = await this.productService.findAll(
        limit,
        offset,
      );

      if (!products || products.length === 0) {
        await ctx.reply('هیچ محصولی یافت نشد 😔');
        return null; // Indicate no products found
      }
      return products; // Return fetched products
    } catch (error) {
      this.logger.error(
        `Error fetching products: limit=${limit}, offset=${offset}`,
        error,
      );
      await ctx.reply('خطا در دریافت محصولات');
      return null; // Indicate an error occurred
    }
  }

  private async sendProductBatchToChat(
    products: ProductDocument[],
    ctx: Context,
  ): Promise<void> {
    try {
      await Promise.all(
        products.map(async (product: ProductDocument) => {
          try {
            const caption = this.formatProductCaption(product);
            const keyboard = this.createProductShowKeyboard(product);

            const url =
              product.images && product.images.length > 0
                ? `${this.prefixImagePath}/${product.images[0]}`
                : this.defaultImagePath;

            this.logger.debug(`Attempting to send photo: ${url}`); // Log the URL being used
            if (!url || typeof url !== 'string' || !url.startsWith('http')) {
              throw new Error(`Invalid image URL generated: ${url}`);
            }

            await ctx.replyWithPhoto(
              { url },
              {
                caption,
                parse_mode: 'MarkdownV2',
                ...keyboard,
              },
            );
          } catch (error) {
            const productId = product._id || 'unknown';
            if (error instanceof Error) {
              this.logger.error(
                `Error sending product ${productId}: ${error.message}`,
                error.stack,
                error?.message,
              );
            } else {
              this.logger.error(`Error sending product ${productId}:`, error);
            }
          }
        }),
      );
    } catch (error) {
      this.logger.error(
        'Error during batch product sending or pagination',
        error,
      );
      await ctx.reply('خطا در نمایش دسته ای محصولات.');
    }
  }

  async handleBrowseProducts2(
    limit: number,
    offset: number,
    ctx: Context,
  ): Promise<void> {
    try {
      const products = await this.fetchProductBatch(limit, offset, ctx);
      if (products && products.length > 0) {
        await this.sendProductBatchToChat(products, ctx /*, offset, limit */); // Pass products to the sending method
      }

      const next_page = {
        limit: 10,
        offset: 10,
      };
      await ctx.reply(
        TelegramMessages.ProductMovingPages,
        Markup.inlineKeyboard([
          Markup.button.callback('صفحه بعد ⬅️', JSON.stringify(next_page)),
          Markup.button.callback('صفحه قبل ➡️', JSON.stringify(next_page)),
        ]),
      );
    } catch (error) {
      this.logger.error(
        `Unhandled error in handleBrowseProducts2 orchestrator: limit=${limit}, offset=${offset}`,
        error,
      );
    }
  }

  // Optional: Keep the simpler entry point if needed
  async handleBrowseProducts(ctx: Context) {
    // Call the main handler with default starting values (e.g., first page)
    await this.handleBrowseProducts2(10, 0, ctx);
  }
  async callBackQuery(ctx: Context) {
    try {
      const callbackData = ctx.callbackQuery['data'];
      if (!callbackData) {
        await ctx.reply(TelegramMessages.ErrorGenegral);
        return;
      }
      const action = JSON.parse(callbackData);
      if (action in CallbackActionEnums) {
        switch (action) {
          case CallbackActionEnums.ProductShowAll:
            //@ts-ignore
            return this.handleBrowseProducts2(data?.limit, data?.offset, data);
            break;
        }
      }
    } catch (error) {
      this.logger.error('Error parsing callback query data:', error);
      await ctx.reply(TelegramMessages.ErrorGenegral);
    }
  }
}
