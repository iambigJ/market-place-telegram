import { Context, Markup } from 'telegraf';
import { Logger } from '@nestjs/common';
import { ProductService } from '../../apis/product/product.service';

export class TelegramHandlers {
  constructor(
    private productService: ProductService,
    private logger: Logger,
  ) {}

  async handleQueries(ctx: Context) {}
  async handleShowProduct(ctx: Context) {
    await ctx.reply('Please enter the product ID:', Markup.forceReply());
  }

  async sendMainMenuKeyboard(ctx: Context) {
    try {
      await ctx.reply(
        'به منوی اصلی خوش آمدید!',
        Markup.keyboard([
          ['منو فروشنده ها 👤', 'منو خریداران 🛍️'],
          ['اموزش استفاده 💬', 'قوانین و مقررات 📜'],
        ])
          .resize()
          .oneTime(false),
      );
    } catch (error) {
      this.logger.error('Error sending main menu keyboard:', error);
    }
  }

  async handleStart(ctx: Context) {
    await this.sendMainMenuKeyboard(ctx);
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
        '🏡 به منوی اصلی خوش آمدید!',
        Markup.keyboard([
          ['🗂️ تمام دسته بندی ها', '📦 تمام محصولات'],
          ['🔍 جستجوی تکی', '🔬 جستجوی پیشرفته'],
          ['❤️ علاقه مندی ها ', '🛒 سبد خرید'],
          ['بازگشت به منوی اصلی'],
        ])
          .resize()
          .oneTime(false),
      );
    } catch (error) {
      this.logger.error('Error sending main menu keyboard:', error);
      await ctx.reply(
        '⚠️ مشکلی در نمایش منو پیش آمد. لطفا دوباره امتحان کنید.',
      );
    }
  }

  async handleBuyerMenu(ctx: Context) {
    await ctx.reply('این منو هنوز ساخته نشده است');
  }

  async handleTutorial(ctx: Context) {
    await ctx.reply('راهنمای استفاده از ربات');
  }

  async handleRules(ctx: Context) {
    await ctx.reply('قوانین و مقررات');
  }

  private escapeMarkdownV2(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  }

  private formatProductCaption(product: any): string {
    const escapedName = this.escapeMarkdownV2(product.name);
    const escapedPrice = this.escapeMarkdownV2(product.price);
    const escapedDescription = this.escapeMarkdownV2(product.description);

    return `
📦 *${escapedName}*
💰 قیمت: ${escapedPrice} تومان
📝 توضیحات: ${escapedDescription}
  `;
  }

  private createProductKeyboard(product: any) {
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

  async handleBrowseProducts(ctx: Context) {
    try {
      const products = await this.productService.findAll();
      if (!products || products.length === 0) {
        await ctx.reply('هیچ محصولی یافت نشد 😔');
        return;
      }

      const caption = 'This is a caption for the entire album';
      await Promise.all(
        products.map(async (product: any) => {
          try {
            const keyboard = this.createProductKeyboard(product);
            await ctx.replyWithPhoto(
              {
                url: 'http://192.168.43.229:3003/storage/png-transparent-iphone-13-pro-back.png-1742730966407-387775944.png',
              },
              {
                caption,
                parse_mode: 'MarkdownV2',
                ...keyboard,
              },
            );
          } catch (error) {
            if (error instanceof Error) {
              this.logger.error(
                `Error sending product: ${error.message}`,
                error.stack,
              );
            } else {
              this.logger.error(`Error sending product:`, error);
            }
            await ctx.reply(`خطا در ارسال محصول`);
          }
        }),
      );

      await ctx.reply(
        "Let's create a new product! Please enter the product name:",
        {
          reply_markup: {
            force_reply: true,
            selective: true,
          },
        },
      );
      await this.sendMainMenuKeyboard(ctx);

      await ctx.replyWithMarkdownV2('Choose an option:', {
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              'Option 1',
              JSON.stringify({ data: 'data', id: '124325325' }),
            ),
          ],
          [Markup.button.callback('Option 2', 'option_2')],
        ]),
      });
    } catch (error) {
      this.logger.error(`Error in handleBrowseProducts:`, error);
      await ctx.reply('خطایی در هنگام نمایش محصولات رخ داد.');
    }
  }

  async handleViewProfile(ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply('پروفایل شما');
  }

  async handleSettings(ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply('تنظیمات');
  }

  async handleHelp(ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply('راهنما');
  }

  async handleCallbackQuery(ctx: Context) {
    console.log(ctx);
  }
}
