import { Injectable, Logger } from '@nestjs/common';
import { Context, Middleware } from 'telegraf';
import { UsersService } from '../../apis/users/users.service';

@Injectable()
export class TelegramAuthMiddleware {
  private readonly logger = new Logger(TelegramAuthMiddleware.name);

  constructor(private readonly usersService: UsersService) {}

  middleware(): Middleware<Context> {
    return async (ctx, next) => {
      try {
        const userId = ctx.from?.id;

        if (!userId) {
          this.logger.warn('No user ID found in context');
          await ctx.reply('خطا در شناسایی کاربر. لطفا دوباره تلاش کنید.');
          return;
        }
        const user = await this.usersService.findByTeleId(
          (userId as unknown as number).toString(),
        );
        console.dir(ctx, { depth: 20 });

        if (!user) {
          // Create a new user
          const username = ctx.from.username || `user_${userId}`;
          const firstName = ctx.from.first_name || '';
          const lastName = ctx.from.last_name || '';
          await this.usersService.createByTelegram({
            telegramId: userId.toString(),
            username,
            firstName,
            lastName,
          });

          this.logger.log(
            `Created new user from Telegram: ${username} (${userId})`,
          );
        }

        // Continue processing
        return next();
      } catch (error) {
        this.logger.error('Error in auth middleware:', error);
        await ctx.reply('خطا در احراز هویت. لطفا دوباره تلاش کنید.');
      }
    };
  }
}
