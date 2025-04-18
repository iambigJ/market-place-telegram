import { Injectable, Logger } from '@nestjs/common';
import { Context, Middleware } from 'telegraf';
import { Inject } from '@nestjs/common';
import { CacheService } from '../../../common/cache/redis-service';
import {
  ConversationState,
  UserStateData,
  createUserStateKey,
  SEARCH_COMMANDS,
  StateMessages,
} from '../helper/tele-state-handler';

@Injectable()
export class TelegramStateMiddleware {
  private readonly logger = new Logger(TelegramStateMiddleware.name);
  private readonly STATE_TTL = 60 * 30; // 30 minutes

  constructor(@Inject('RedisCacheService') private cacheService: CacheService) {
    this.cacheService.setContext('telegram');
  }

  /**
   * Get the current state for a user
   * @param userId Telegram user ID
   * @returns User state or null if not found
   */
  async getUserState(userId: string): Promise<UserStateData | null> {
    try {
      const stateKey = createUserStateKey(userId);
      return await this.cacheService.get<UserStateData>(stateKey);
    } catch (error) {
      this.logger.error(
        `Error getting user state: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Save user state to Redis
   * @param userId Telegram user ID
   * @param state State to save
   * @returns true if saved successfully
   */
  async setUserState(userId: string, state: UserStateData): Promise<boolean> {
    try {
      const stateKey = createUserStateKey(userId);
      await this.cacheService.set<UserStateData>(
        stateKey,
        state,
        this.STATE_TTL,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error setting user state: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Clear user state (resets to IDLE)
   * @param userId Telegram user ID
   */
  async clearUserState(userId: string): Promise<void> {
    try {
      const stateKey = createUserStateKey(userId);
      const newState: UserStateData = {
        state: ConversationState.IDLE,
        data: {},
        lastUpdated: Date.now(),
      };
      await this.cacheService.set<UserStateData>(
        stateKey,
        newState,
        this.STATE_TTL,
      );
    } catch (error) {
      this.logger.error(
        `Error clearing user state: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Check if user is in a specific state
   * @param userId Telegram user ID
   * @param state State to check
   * @returns true if user is in specified state
   */
  async isInState(userId: string, state: ConversationState): Promise<boolean> {
    const userState = await this.getUserState(userId);
    return userState?.state === state;
  }

  /**
   * Initialize user state if not already set
   * @param userId Telegram user ID
   */
  async initUserState(userId: string): Promise<void> {
    const state = await this.getUserState(userId);
    if (!state) {
      await this.clearUserState(userId);
    }
  }

  /**
   * Create middleware for Telegraf
   * @returns Telegraf middleware function
   */
  middleware(): Middleware<Context> {
    return async (ctx, next) => {
      try {
        const userId = ctx.from?.id.toString();
        if (!userId) {
          return next();
        }

        // Initialize state if needed
        await this.initUserState(userId);
        const currentState = await this.getUserState(userId);

        // Attach state to context for handlers to use
        ctx.state.userState = currentState;
        ctx.state.stateManager = this;

        // Always allow cancellation
        if (
          ctx.message &&
          'text' in ctx.message &&
          ctx.message.text === SEARCH_COMMANDS.CANCEL_SEARCH
        ) {
          await this.clearUserState(userId);
          await ctx.reply(StateMessages.SEARCH_CANCEL);
          return next();
        }

        // Handle text messages based on current state
        if (ctx.message && 'text' in ctx.message) {
          const text = ctx.message.text;

          // Start simple search
          if (
            text === SEARCH_COMMANDS.SIMPLE_SEARCH &&
            currentState?.state === ConversationState.IDLE
          ) {
            await this.setUserState(userId, {
              state: ConversationState.SEARCH_WAITING_QUERY,
              data: {},
              lastUpdated: Date.now(),
            });
            await ctx.reply(StateMessages.SEARCH_PROMPT);
            return; // Stop middleware chain
          }

          // Start advanced search
          if (
            text === SEARCH_COMMANDS.ADVANCED_SEARCH &&
            currentState?.state === ConversationState.IDLE
          ) {
            await this.setUserState(userId, {
              state: ConversationState.ADVANCED_SEARCH_NAME,
              data: { advancedSearch: {} },
              lastUpdated: Date.now(),
            });
            await ctx.reply(StateMessages.ADVANCED_SEARCH_NAME_PROMPT);
            return; // Stop middleware chain
          }

          // Process search query
          if (currentState?.state === ConversationState.SEARCH_WAITING_QUERY) {
            // Here, we just save the query and continue to the next middleware
            // That middleware will handle the actual search
            await this.setUserState(userId, {
              state: ConversationState.SEARCH_RESULTS,
              data: { searchQuery: text },
              lastUpdated: Date.now(),
            });
            await ctx.reply(StateMessages.SEARCH_PROCESSING);
            // Allow execution to continue to the search handler
          }

          // Process advanced search - name
          if (currentState?.state === ConversationState.ADVANCED_SEARCH_NAME) {
            const advancedSearch = { ...currentState.data.advancedSearch };
            if (text !== '-') {
              advancedSearch.name = text;
            }

            await this.setUserState(userId, {
              state: ConversationState.ADVANCED_SEARCH_CATEGORY,
              data: { advancedSearch },
              lastUpdated: Date.now(),
            });
            await ctx.reply(StateMessages.ADVANCED_SEARCH_CATEGORY_PROMPT);
            return; // Stop middleware chain
          }

          // Process advanced search - category
          if (
            currentState?.state === ConversationState.ADVANCED_SEARCH_CATEGORY
          ) {
            const advancedSearch = { ...currentState.data.advancedSearch };
            if (text !== '-') {
              advancedSearch.category = text;
            }

            await this.setUserState(userId, {
              state: ConversationState.ADVANCED_SEARCH_PRICE_MIN,
              data: { advancedSearch },
              lastUpdated: Date.now(),
            });
            await ctx.reply(StateMessages.ADVANCED_SEARCH_PRICE_MIN_PROMPT);
            return; // Stop middleware chain
          }

          // Process advanced search - min price
          if (
            currentState?.state === ConversationState.ADVANCED_SEARCH_PRICE_MIN
          ) {
            const advancedSearch = { ...currentState.data.advancedSearch };

            if (text !== '-') {
              const priceMin = Number(text);
              if (isNaN(priceMin)) {
                await ctx.reply(StateMessages.INVALID_PRICE);
                return; // Stay in current state
              }
              advancedSearch.priceMin = priceMin;
            }

            await this.setUserState(userId, {
              state: ConversationState.ADVANCED_SEARCH_PRICE_MAX,
              data: { advancedSearch },
              lastUpdated: Date.now(),
            });
            await ctx.reply(StateMessages.ADVANCED_SEARCH_PRICE_MAX_PROMPT);
            return; // Stop middleware chain
          }

          // Process advanced search - max price
          if (
            currentState?.state === ConversationState.ADVANCED_SEARCH_PRICE_MAX
          ) {
            const advancedSearch = { ...currentState.data.advancedSearch };

            if (text !== '-') {
              const priceMax = Number(text);
              if (isNaN(priceMax)) {
                await ctx.reply(StateMessages.INVALID_PRICE);
                return; // Stay in current state
              }
              advancedSearch.priceMax = priceMax;
            }

            // Final state - ready for search
            await this.setUserState(userId, {
              state: ConversationState.ADVANCED_SEARCH_RESULTS,
              data: { advancedSearch },
              lastUpdated: Date.now(),
            });
            await ctx.reply(StateMessages.SEARCH_PROCESSING);
            // Allow execution to continue to the search handler
          }
        }

        return next();
      } catch (error) {
        this.logger.error(
          `State middleware error: ${error.message}`,
          error.stack,
        );
        return next();
      }
    };
  }
}
