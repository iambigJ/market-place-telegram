import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { TelegramHandlers } from '../providers/telegram-general.handler';
import { TelegramCommands, TelegramHears } from '../helper/telegram.constants';
import { TelegramProductHandler } from '../providers/telegram-main.handler';
import {
  ITelegramHandler,
  ITelegramProductService,
} from '../interfaces/telegram.interface';

@Injectable()
export class TelegramInit implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramInit.name);

  constructor(
    private readonly config: ConfigService,
    private readonly productService: TelegramProductHandler,
    private readonly handlers: TelegramHandlers,
  ) {}

  async onModuleInit(): Promise<void> {
    this.boot();
  }

  async onModuleDestroy(): Promise<void> {
    await this.handleShutdown('SIGTERM');
  }

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
    } catch (error) {
      this.logger.error('Failed to start telegram bot:', error);
      throw error;
    }
  }

  private handleShutdown(signal: string) {
    this.logger.log(`Received ${signal} signal, shutting down bot...`);
    if (this.bot) {
      this.bot.stop(signal);
    }
  }

  private setupEventHandlers(): void {
    this.bot.on('callback_query', async (ctx: Context) => {
      try {
        await this.handlers.callBackQuery(ctx);
      } catch (error) {
        this.logger.error('Error in callback query handler:', error);
      }
    });

    // Command handlers
    this.bot.command(TelegramCommands.START, async (ctx) => {
      try {
        await this.handlers.handleStart(ctx);
      } catch (error) {
        this.logger.error('Error in start command handler:', error);
      }
    });

    this.bot.command(TelegramCommands.QUIT, async (ctx) => {
      try {
        await this.handlers.handleQuit(ctx);
      } catch (error) {
        this.logger.error('Error in quit command handler:', error);
      }
    });

    // Text message handlers
    this.bot.hears(TelegramHears.BUYER_MENU, async (ctx) => {
      try {
        await this.handlers.handleBuyerMenu(ctx);
      } catch (error) {
        this.logger.error('Error in buyer menu handler:', error);
      }
    });

    this.bot.hears(TelegramHears.SELLER_MENU, async (ctx) => {
      try {
        await this.handlers.handleSellerMenu(ctx);
      } catch (error) {
        this.logger.error('Error in seller menu handler:', error);
      }
    });

    this.bot.hears(TelegramHears.BYVIP, async (ctx) => {
      try {
        await this.handlers.handleTutorial(ctx);
      } catch (error) {
        this.logger.error('Error in tutorial handler:', error);
      }
    });

    this.bot.hears(TelegramHears.RULES, async (ctx) => {
      try {
        await this.handlers.handleRules(ctx);
      } catch (error) {
        this.logger.error('Error in rules handler:', error);
      }
    });

    this.bot.hears(TelegramHears.HELP, async (ctx) => {
      try {
        await this.handlers.notImplemented(ctx);
      } catch (error) {
        this.logger.error('Error in help handler:', error);
      }
    });

    this.bot.hears(TelegramHears.BACK_TO_MAIN, async (ctx) => {
      try {
        await this.handlers.sendMainMenuKeyboard(ctx);
      } catch (error) {
        this.logger.error('Error in back to main handler:', error);
      }
    });

    // Product section
    this.bot.hears(TelegramHears.BROWSE_PRODUCTS, async (ctx) => {
      try {
        await this.productService.handleShowAllProducts(ctx);
      } catch (error) {
        this.logger.error('Error in browse products handler:', error);
      }
    });

    this.bot.catch((err: Error) => {
      this.logger.error('Telegram bot error:', err);
    });
  }
}
