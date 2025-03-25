import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/common/cache/redis-service';
import { Telegraf, Context } from 'telegraf';
import { ProductService } from '../apis/product/product.service';
import { TelegramHandlers } from './core/telegram-handlers';

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

  handleShutdown(signal: string) {
    this.logger.log(`Received ${signal} signal, shutting down bot...`);
    this.bot.stop(signal);
  }

  private setupEventHandlers() {
    const handlers = new TelegramHandlers(this.productService, this.logger);
    this.bot.command('showproduct', handlers.handleShowProduct.bind(handlers));
    this.bot.command('start', handlers.handleStart.bind(handlers));
    this.bot.command('quit', handlers.handleQuit.bind(handlers));

    this.bot.hears(
      'منو فروشنده ها 👤',
      handlers.handleBuyerMenu.bind(handlers),
    );
    this.bot.hears('منو خریداران 🛍️', handlers.handleSellerMenu.bind(handlers));
    this.bot.hears('اموزش استفاده 💬', handlers.handleTutorial.bind(handlers));
    this.bot.hears('قوانین و مقررات 📜', handlers.handleRules.bind(handlers));
    this.bot.hears(
      '📦 تمام محصولات',
      handlers.handleBrowseProducts.bind(handlers),
    );
    this.bot.hears('view_profile', handlers.handleViewProfile.bind(handlers));
    this.bot.hears('settings', handlers.handleSettings.bind(handlers));
    this.bot.hears('help', handlers.handleHelp.bind(handlers));
    this.bot.hears(
      'بازگشت به منوی اصلی',
      handlers.sendMainMenuKeyboard.bind(handlers),
    );    

    this.bot.on('callback_query', handlers.handleCallbackQuery.bind(handlers));

    this.bot.catch((err: Error) => {
      this.logger.error('Telegram bot error:', err);
    });
  }
}
