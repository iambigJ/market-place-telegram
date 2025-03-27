import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/common/cache/redis-service';
import { Telegraf, Context } from 'telegraf';
import { ProductService } from '../../apis/product/product.service';
import { TelegramHandlers } from './telegram-handlers';

@Injectable()
export class TelegramInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramInit.name);

  constructor(
    private productService: ProductService,
    private config: ConfigService,
    private cache: CacheService,
  ) {}

  async boot() {
    try {
      this.bot = new Telegraf(this.config.get<string>('Telegram_Token'));
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

  handleShutdown(signal: string) {
    this.logger.log(`Received ${signal} signal, shutting down bot...`);
    this.bot.stop(signal);
  }

  private setupEventHandlers() {
    const handlers = new TelegramHandlers(this.productService, this.logger);
    this.bot.command('showproduct', (ctx) => handlers.handleShowProduct(ctx));
    this.bot.command('start', (ctx) => handlers.handleStart(ctx));
    this.bot.command('quit', (ctx) => handlers.handleQuit(ctx));
    this.bot.hears('منو فروشنده ها 👤', (ctx) => handlers.handleBuyerMenu(ctx));
    this.bot.hears('منو خریداران 🛍️', (ctx) => handlers.handleSellerMenu(ctx));
    this.bot.hears('اموزش استفاده 💬', (ctx) => handlers.handleTutorial(ctx));
    this.bot.hears('قوانین و مقررات 📜', (ctx) => handlers.handleRules(ctx));
    this.bot.hears('📦 تمام محصولات', (ctx) =>
      handlers.handleBrowseProducts(ctx),
    );
    this.bot.hears('help', (ctx) => handlers.notImplemented(ctx));
    this.bot.hears('بازگشت به منوی اصلی', (ctx) =>
      handlers.sendMainMenuKeyboard(ctx),
    );

    this.bot.catch((err: Error) => {
      this.logger.error('Telegram bot error:', err);
    });
  }
}
