import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { Injectable } from '@nestjs/common';

const bot = new Telegraf('7575430823:AAFuueUyIJGyeBnQqMlh8ycgEJ-4ZOxFeYQ');

@Injectable()
export class TelegramInit {
  async boot() {
    console.log('shapalakh');
  }
}

// Main Menu Keyboard
function sendMainMenuKeyboard(ctx) {
  ctx.reply(
    'Welcome to the Main Menu!',
    Markup.keyboard([['Menu 1'], ['Menu 2'], ['Settings']])
      .resize() // Optional: Resize keyboard
      .oneTime(false), // Optional: Keep keyboard persistent (false by default, can be true for one-time)
  );
}

// Menu 1 Keyboard
function sendMenu1Keyboard(ctx) {
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
function sendMenu2Keyboard(ctx) {
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
function sendSettingsKeyboard(ctx) {
  ctx.reply(
    'Settings Menu:',
    Markup.keyboard([['Profile', 'Notifications'], ['Back to Main Menu']])
      .resize()
      .oneTime(),
  );
}

// --- Command Handlers (to initially show menus) ---

bot.command('start', sendMainMenuKeyboard); // /start will show the main menu
bot.command('mainmenu', sendMainMenuKeyboard); // /mainmenu will also show the main menu (optional alias)
bot.command('menu1', sendMenu1Keyboard); // /menu1 will show Menu 1
bot.command('menu2', sendMenu2Keyboard); // /menu2 will show Menu 2
bot.command('settings', sendSettingsKeyboard); // /settings will show Settings menu

// --- Message Handlers (to handle button clicks from Reply Keyboards) ---

bot.hears('Main Menu', sendMainMenuKeyboard); // Handle "Main Menu" button click (goes to main menu)

bot.hears('Menu 1', sendMenu1Keyboard); // Handle "Menu 1" button click
bot.hears('Menu 2', sendMenu2Keyboard); // Handle "Menu 2" button click
bot.hears('Settings', sendSettingsKeyboard); // Handle "Settings" button click

bot.hears('Option A', (ctx) => ctx.reply('You selected Option A!')); // Handle "Option A" from Menu 1
bot.hears('Option B', (ctx) => ctx.reply('You selected Option B!')); // Handle "Option B" from Menu 1
bot.hears('Option C', (ctx) => ctx.reply('You selected Option C!')); // Handle "Option C" from Menu 2
bot.hears('Option D', (ctx) => ctx.reply('You selected Option D!')); // Handle "Option D" from Menu 2

bot.hears('Profile', (ctx) => ctx.reply('Opening Profile Settings...')); // Handle "Profile" from Settings Menu
bot.hears('Notifications', (ctx) =>
  ctx.reply('Opening Notification Settings...'),
); // Handle "Notifications" from Settings Menu

// --- Fallback Handler (for unknown messages - optional) ---
bot.on('message', (ctx) => {
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
      sendMainMenuKeyboard(ctx); // Optionally resend the main menu
    }
  }
});

bot.launch();
