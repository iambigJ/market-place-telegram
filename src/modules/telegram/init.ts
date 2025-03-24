import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/common/cache/redis-service';
import { Markup, Telegraf, Context } from 'telegraf';
import { ProductService } from '../apis/product/product.service';

@Injectable()
export class TelegramInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramInit.name);

  constructor(
    private productService: ProductService
    private config: ConfigService,
    private cache: CacheService,
  ) {}

  async boot() {
    try {
      this.bot = new Telegraf(this.config.get<string>('telegram_token'));
      this.setupEventHandlers();
      await this.bot.launch();
      this.logger.log('Telegram bot started successfully');

      process.once('SIGINT', () => this.handleShutdown('SIGINT'));
      process.once('SIGTERM', () => this.handleShutdown('SIGTERM'));
      await this.cache.getRedisClient();
    } catch (error) {
      this.logger.error('Failed to start telegram bot:', error);
      throw error;
    }
  }

  private async handleShutdown(signal: string) {
    this.logger.log(`Received ${signal} signal, shutting down bot...`);
    await this.bot.stop(signal);
  }

  private setupEventHandlers() {
    // Command handlers
    this.bot.command('start', (ctx) => this.sendMainMenuKeyboard(ctx));
    this.bot.command('sheps', (ctx) => this.sendMainMenu(ctx));
    this.bot.command('quit', (ctx) => this.handleQuit(ctx));

    // Text handlers
    this.bot.hears('منو فروشنده ها 👤', (ctx) => this.handleSellerMenu(ctx));
    this.bot.hears('منو خریداران 🛍️', (ctx) => this.handleBuyerMenu(ctx));
    this.bot.hears('اموزش استفاده 💬', (ctx) => this.handleTutorial(ctx));
    this.bot.hears('قوانین و مقررات 📜', (ctx) => this.handleRules(ctx));

    // Callback query handlers
    this.bot.action('browse_products', (ctx) => this.handleBrowseProducts(ctx));
    this.bot.action('view_profile', (ctx) => this.handleViewProfile(ctx));
    this.bot.action('settings', (ctx) => this.handleSettings(ctx));
    this.bot.action('help', (ctx) => this.handleHelp(ctx));

    // Error handler
    this.bot.catch((err: Error) => {
      this.logger.error('Telegram bot error:', err);
    });
  }

  private async sendMainMenuKeyboard(ctx: Context) {
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

  private async sendMainMenu(ctx: Context) {
    try {
      await ctx.replyWithMarkdownV2(
        '*منوی اصلی*\n\nلطفا یک گزینه را انتخاب کنید:',
        Markup.inlineKeyboard([
          [Markup.button.callback('🛍️ مشاهده محصولات', 'browse_products')],
          [Markup.button.callback('👤 پروفایل من', 'view_profile')],
          [Markup.button.callback('⚙️ تنظیمات', 'settings')],
          [Markup.button.callback('❓ راهنما', 'help')],
        ]),
      );
    } catch (error) {
      this.logger.error('Error sending main menu:', error);
    }
  }


  //todo fix this
  private async handleQuit(ctx: Context) {
    try {
      if ('message' in ctx && 'chat' in ctx.message) {
        await ctx.telegram.leaveChat(ctx.message.chat.id);
        await ctx.leaveChat();
      }
    } catch (error) {
      this.logger.error('Error handling quit command:', error);
    }
  }

  private async handleSellerMenu(ctx: Context) {
    try {
      await ctx.reply(
        '🏡 به منوی اصلی خوش آمدید!', // Added home emoji
        Markup.keyboard([
          ['🗂️ تمام دسته بندی ها', '📦 تمام محصولات'], // Category and Products emojis
          ['🔍 جستجوی تکی', '🔬 جستجوی پیشرفته'], // Single and Advanced Search emojis
          ['❤️ علاقه مندی ها ', '🛒 سبد خرید'], // Favorites and Shopping Cart emojis
        ])
          .resize()
          .oneTime(false),
      );
    } catch (error) {
      this.logger.error('Error sending main menu keyboard:', error);
      // Consider sending a generic error message to the user, but avoid sensitive details:
      await ctx.reply(
        '⚠️ مشکلی در نمایش منو پیش آمد. لطفا دوباره امتحان کنید.',
      );
    }
  }

  private async handleBuyerMenu(ctx: Context) {
    await ctx.reply('منوی خریداران');
  }

  private async handleTutorial(ctx: Context) {
    await ctx.reply('راهنمای استفاده از ربات');
  }

  private async handleRules(ctx: Context) {
    await ctx.reply('قوانین و مقررات');
  }

  private async handleBrowseProducts(ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply('مشاهده محصولات');
  }

  private async handleViewProfile(ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply('پروفایل شما');
  }

  private async handleSettings(ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply('تنظیمات');
  }

  private async handleHelp(ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply('راهنما');
  }
}
