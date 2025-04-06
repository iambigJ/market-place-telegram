import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { TelegramHandlers } from './telegram-handlers';
import { TelegramCommands, TelegramHears } from '../helper/telegram.constants';
import { TelegramProductService } from './providers/telegram-product.service';

@Injectable()
export class TelegramInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramInit.name);

  constructor(
    private productService: TelegramProductService,
    private config: ConfigService,
    private handlers: TelegramHandlers,
  ) {}

  async boot(): Promise<void> {
    try {
      const token = this.config.get<string>('Telegram_Token');
      if (!token) {
        throw new Error('Telegram token not found in configuration');
      }
      this.bot = new Telegraf(token);
      this.setupEventHandlers();
      await this.bot.launch();
      this.logger.log('Telegram bot started successfully');
      process.once('SIGINT', () => this.handleShutdown('SIGINT'));
      process.once('SIGTERM', () => this.handleShutdown('SIGTERM'));
    } catch (error) {
      this.logger.error('Failed to start telegram bot:', error);
      throw error;
    }
  }

  handleShutdown(signal: string): void {
    this.logger.log(`Received ${signal} signal, shutting down bot...`);
    this.bot.stop(signal);
  }

  private setupEventHandlers(): void {setupEventHandlers(): void {
    this.bot.on('callback_query', (ctx: Context) => {
    this.handlers.callBackQuery(ctx);
    });

    // Command handlers
    this.bot.command(TelegramCommands.START, (ctx) =>
      this.handlers.handleStart(ctx),
    );
    this.bot.command(TelegramCommands.QUIT, (ctx) =>
      this.handlers.handleQuit(ctx),
    );

    // Text message handlers
    this.bot.hears(TelegramHears.BUYER_MENU, (ctx) =>
      this.handlers.handleBuyerMenu(ctx),
    );
    this.bot.hears(TelegramHears.SELLER_MENU, (ctx) =>
      this.handlers.handleSellerMenu(ctx),
    );
    this.bot.hears(TelegramHears.TUTORIAL, (ctx) =>
      this.handlers.handleTutorial(ctx),
    );
    this.bot.hears(TelegramHears.RULES, (ctx) =>
      this.handlers.handleRules(ctx),
    );
    this.bot.hears(TelegramHears.HELP, (ctx) =>
      this.handlers.notImplemented(ctx),
  );
  this.bot.hears(TelegramHears.BACK_TO_MAIN, (ctx) =>
    this.handlers.sendMainMenuKeyboard(ctx),
    );
    //prdocut section
    this.bot.hears(TelegramHears.BROWSE_PRODUCTS, (ctx) =>
      this.productService.handleShowAllProducts(ctx),
    );

    this.bot.catch((err: Error) => {
      this.logger.error('Telegram bot error:', err);
    });
  }
}
