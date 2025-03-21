import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/common/cache/redis-service';
import { Markup, Telegraf } from 'telegraf';
@Injectable()
export class TelegramInit {
  private bot: Telegraf;
  constructor(
    private config: ConfigService,
    private cache: CacheService,
  ) {}
  async boot() {
    this.bot = new Telegraf(this.config.get<string>('telegram_token'));
    this.runEvents();
    await this.bot.launch();
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    this.cache.getRedisClient();
  }

  // Main Menu Keyboards
  sendMainMenuKeyboard(ctx) {
    ctx.reply(
      'Welcome to the Main Menu!',
      Markup.keyboard([['Menu 1'], ['Menu 2'], ['Settings']])
        .resize() // Optional: Resize keyboard
        .oneTime(false), // Optional: Keep keyboard persistent (false by default, can be true for one-time)
    );
  }

  // Menu 1 Keyboard
  sendMenu1Keyboard(ctx) {
    ctx.reply(
      'Menu 1 - Choose an option:',
      Markup.keyboard([
        ['Option A', 'Option B'],
        ['Back to Main Menu'], // Navigation back to main menu
      ])
        .resize()
        .oneTime(), // One-time keyboard for submenus is often a good choice
    );
  }

  // Menu 2 Keyboard
  sendMenu2Keyboard(ctx) {
    ctx.reply(
      'Menu 2 - Explore these choices:',
      Markup.keyboard([
        ['Option C', 'Option D'],
        ['Back to Main Menu'], // Navigation
      ])
        .resize()
        .oneTime(),
    );
  }

  // Settings Menu Keyboard (example)
  sendSettingsKeyboard(ctx) {
    ctx.reply(
      'Settings Menu:',
      Markup.keyboard([['Profile', 'Notifications'], ['Back to Main Menu']])
        .resize()
        .oneTime(),
    );
  }
  runEvents() {
    this.bot.command('quit', async (ctx) => {
      // Explicit usage
      await ctx.telegram.leaveChat(ctx.message.chat.id);

      // Using context shortcut
      await ctx.leaveChat();
    });

    // --- Command Handlers (to initially show menus) ---

    this.bot.command('start', this.sendMainMenuKeyboard); // /start will show the main menu
    this.bot.command('mainmenu', this.sendMainMenuKeyboard); // /mainmenu will also show the main menu (optional alias)
    this.bot.command('menu1', this.sendMenu1Keyboard); // /menu1 will show Menu 1
    this.bot.command('menu2', this.sendMenu2Keyboard); // /menu2 will show Menu 2
    this.bot.command('settings', this.sendSettingsKeyboard); // /settings will show Settings menu

    // --- Message Handlers (to handle button clicks from Reply Keyboards) ---

    this.bot.hears('Main Menu', this.sendMainMenuKeyboard); // Handle "Main Menu" button click (goes to main menu)

    this.bot.hears('Menu 1', this.sendMenu1Keyboard); // Handle "Menu 1" button click
    this.bot.hears('Menu 2', this.sendMenu2Keyboard); // Handle "Menu 2" button click
    this.bot.hears('Settings', this.sendSettingsKeyboard); // Handle "Settings" button click

    this.bot.hears('Option A', (ctx) => ctx.reply('You selected Option A!'));
    this.bot.hears('Option B', (ctx) => ctx.reply('You selected Option B!'));
    this.bot.hears('Option C', (ctx) => ctx.reply('You selected Option C!'));
    this.bot.hears('Option D', (ctx) => ctx.reply('You selected Option D!'));

    this.bot.hears('Profile', (ctx) =>
      ctx.reply('Opening Profile Settings...'),
    ); // Handle "Profile" from Settings Menu
    this.bot.hears('Notifications', (ctx) =>
      ctx.reply('Opening Notification Settings...'),
    );
    this.bot.on('message', (ctx) => {
      if ('text' in ctx.message) {
        // Ensure it's a text message
        const text = ctx.message.text;
        const recognizedButtons = [
          'Menu 1',
          'Menu 2',
          'Settings',
          'Option A',
          'Option B',
          'Option C',
          'Option D',
          'Back to Main Menu',
          'Main Menu',
          'Profile',
          'Notifications', // List all button texts
        ];
        if (!recognizedButtons.includes(text)) {
          ctx.reply(
            'Sorry, I did not understand that. Please use the menu options.',
          );
          this.sendMainMenuKeyboard(ctx);
        }
      }
    });
  }
}
