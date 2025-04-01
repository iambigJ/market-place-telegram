import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/common/cache/redis-service';
import { Telegraf } from 'telegraf';
import { ProductService } from '../../apis/product/product.service';
import { TelegramHandlers } from './telegram-handlers';
import { TelegramCommands, TelegramHears } from '../helper/telegram.constants';
import { UsersService } from 'src/modules/apis/users/users.service';
import { OrderService } from 'src/modules/apis/order/order.service';
import { CategoryService } from 'src/modules/apis/categories/categoy.service';

@Injectable()
export class TelegramInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramInit.name);

  constructor(
    private productService: ProductService,
    private userSerivce: UsersService,
    private orderService: OrderService,
    private categoryService: CategoryService,
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
    const handlers = new TelegramHandlers(
      this.productService,
      this.logger,
      this.config,
    );
    this.bot.on('callback_query', (ctx: any) => {
      handlers.callBackQuery(ctx);
    });

    this.bot.command(TelegramCommands.SHOW_PRODUCT, (ctx) =>
      handlers.handleBrowseProducts(ctx),
    );
    this.bot.command(TelegramCommands.START, (ctx) =>
      handlers.handleStart(ctx),
    );
    this.bot.command(TelegramCommands.QUIT, (ctx) => handlers.handleQuit(ctx));
    this.bot.hears(TelegramHears.BUYER_MENU, (ctx) =>
      handlers.handleBuyerMenu(ctx),
    );
    this.bot.hears(TelegramHears.SELLER_MENU, (ctx) =>
      handlers.handleSellerMenu(ctx),
    );
    this.bot.hears(TelegramHears.TUTORIAL, (ctx) =>
      handlers.handleTutorial(ctx),
    );
    this.bot.hears(TelegramHears.RULES, (ctx) => handlers.handleRules(ctx));
    this.bot.hears(TelegramHears.BROWSE_PRODUCTS, (ctx) =>
      handlers.handleBrowseProducts(ctx),
    );
    this.bot.hears(TelegramHears.HELP, (ctx) => handlers.notImplemented(ctx));
    this.bot.hears(TelegramHears.BACK_TO_MAIN, (ctx) =>
      handlers.sendMainMenuKeyboard(ctx),
    );

    this.bot.catch((err: Error) => {
      this.logger.error('Telegram bot error:', err);
    });
  }
}
