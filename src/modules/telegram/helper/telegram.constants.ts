/**
 * Commands that can be triggered with a / prefix in Telegram
 */
export enum TelegramCommands {
  SHOW_PRODUCT = 'showproduct',
  START = 'start',
  QUIT = 'quit',
}

/**
 * Text messages that the bot listens for
 */
export enum TelegramHears {
  BUYER_MENU = 'منو خریداران 🛍️',
  SELLER_MENU = 'منو فروشنده ها 👤',
  BYVIP = 'خرید اشتراک ویژه 💬',
  RULES = 'قوانین و مقررات 📜',
  BROWSE_PRODUCTS = '📦 تمام محصولات',
  HELP = 'help',
  BACK_TO_MAIN = 'بازگشت به منوی اصلی',
}

/**
 * Response messages sent by the bot
 */
export enum TelegramMessages {
  WELCOME_MAIN = 'به منوی اصلی خوش آمدید!',
  WELCOME_BUYER = 'به منوی خریداران خوش امدید',
  WELCOME_SELLER = '🏡 به منوی اصلی خوش آمدید!',
  ERROR_MENU = '⚠️ مشکلی در نمایش منو پیش آمد. لطفا دوباره امتحان کنید.',
  NOT_IMPLEMENTED = 'این ایتم هنوز پیاده سازی نشده است',
  BUYER_MENU_NOT_READY = 'این منو هنوز ساخته نشده است',
  ERROR_PRODUCT_SHOW = 'خطایی در هنگام نمایش محصولات رخ داد',
  PRODUCT_MOVING_PAGES = 'جابجایی بین صفحات',
  ERROR_GENERAL = 'خطا در پردازش اطلاعات',
  NO_PRODUCTS = 'هیج محصولی یافت نشد',
}

/**
 * Action identifiers for product-related callback queries
 */
export enum TelegramProductActions {
  ADD_TO_CART = 'add_to_cart_',
  ADD_TO_FAVORITES = 'add_to_favorites_',
  VIEW_PRODUCT = 'view_product_',
}

/**
 * Button labels for product-related actions
 */
export const TelegramProductButtons = {
  ADD_TO_CART: '🛒 افزودن به سبد خرید',
  ADD_TO_CART_CONFIRM: 'ثبت سفارش',
  ADD_TO_CART_CONFIRM_CANCEL: 'انصراف',
  ADD_TO_FAVORITES: '❤️ علاقه‌مندی‌ها',
  VIEW_PRODUCT: 'مشاهده کامل',
} as const;

/**
 * Type definitions for keyboard layouts
 */
type KeyboardButton = string;
type KeyboardRow = KeyboardButton[];
type KeyboardLayout = KeyboardRow[];

/**
 * Predefined keyboard layouts for different menus
 */
export const TelegramKeyboards: Record<
  'MAIN_MENU' | 'SELLER_MENU' | 'BUYER_MENU',
  KeyboardLayout
> = {
  MAIN_MENU: [
    [TelegramHears.SELLER_MENU, TelegramHears.BUYER_MENU],
    [TelegramHears.BYVIP, TelegramHears.RULES],
  ],
  SELLER_MENU: [
    ['🗂️ تمام دسته بندی ها', TelegramHears.BROWSE_PRODUCTS],
    ['🔍 جستجوی تکی', '🔬 جستجوی پیشرفته'],
    ['❤️ علاقه مندی ها ', '🛒 سبد خرید'],
    [TelegramHears.BACK_TO_MAIN],
  ],
  BUYER_MENU: [
    ['🗂️ تمام دسته بندی ها', TelegramHears.BROWSE_PRODUCTS],
    ['🔍 جستجوی محصول', '🔬 جستجوی پیشرفته'],
    ['❤️ علاقه مندی ها', '📋 سفارشات من'],
    [TelegramHears.BACK_TO_MAIN],
  ],
} as const;
