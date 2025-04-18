import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import {
  TelegramCommands,
  TelegramHears,
  TelegramMessages,
} from '../helper/tele-constants';
import { TelegramProductHandler } from '../handlers/tele-buyer-handler';
import { TelegramMenuService } from '../handlers/tele-menu.handler';
import { TelegramAuthMiddleware } from '../middleware/tele-auth-middleware';
import { TelegramStateMiddleware } from '../middleware/tele-state.middleware';
import { TelegramSearchHandler } from '../handlers/tele-search.handler';
import { TelegramHandlers } from '../handlers/tele-callback-handler';
import { ConversationState } from '../helper/tele-state-handler';

@Injectable()
export class TelegramInit implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramInit.name);

  constructor(
    private readonly config: ConfigService,
    private readonly productService: TelegramProductHandler,
    private readonly handlers: TelegramHandlers,
    private readonly menuService: TelegramMenuService,
    private readonly authMiddleware: TelegramAuthMiddleware,
    private readonly stateMiddleware: TelegramStateMiddleware,
    private readonly searchHandler: TelegramSearchHandler,
  ) {}

  onModuleInit() {
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
    // Apply auth middleware to all updates
    this.bot.use(this.authMiddleware.middleware());

    // Apply state management middleware
    this.bot.use(this.stateMiddleware.middleware());

    // Process text messages in any state (state-specific processing is in the middleware)
    this.bot.on('text', async (ctx, next) => {
      try {
        // Check if user state is search results - pass to appropriate handler
        if (ctx.state.userState) {
          if (ctx.state.userState.state === ConversationState.SEARCH_RESULTS) {
            await this.searchHandler.handleSimpleSearch(ctx);
            return; // Stop processing
          } else if (
            ctx.state.userState.state ===
            ConversationState.ADVANCED_SEARCH_RESULTS
          ) {
            await this.searchHandler.handleAdvancedSearch(ctx);
            return; // Stop processing
          }
        }
        return next(); // Continue with middleware chain if not in a search state
      } catch (error) {
        this.logger.error('Error in text message handler:', error);
        return next();
      }
    });

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
        await this.menuService.sendBuyerMenuKeyboard(ctx);
      } catch (error) {
        this.logger.error('Error in buyer menu handler:', error);
      }
    });

    this.bot.hears(TelegramHears.SELLER_MENU, async (ctx) => {
      try {
        await this.menuService.sendSellerMenuKeyboard(ctx);
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
        await this.menuService.sendMainMenuKeyboard(ctx);
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

    this.bot.hears(TelegramHears.BROWSE_CATEGORIES, async (ctx) => {
      try {
        await this.productService.handleShowCategories(ctx);
      } catch (error) {
        this.logger.error('Error in browse categories handler:', error);
      }
    });

    this.bot.hears(TelegramHears.MY_FAVORITES, async (ctx) => {
      try {
        await this.productService.handleShowUserFavorites(ctx);
      } catch (error) {
        this.logger.error('Error in my favorites handler:', error);
      }
    });

    this.bot.hears(TelegramHears.MY_ORDERS, async (ctx) => {
      try {
        await this.productService.handleShowUserOrders(ctx);
      } catch (error) {
        this.logger.error('Error in my orders handler:', error);
      }
    });

    this.bot.catch((err: Error) => {
      this.logger.error('Telegram bot error:', err);
    });
  }
}
