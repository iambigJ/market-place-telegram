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
  BROWSE_CATEGORIES = '📦 دسته‌بندی‌ها',
  MY_ORDERS = '📋 سفارشات من',
  MY_FAVORITES = '❤️ علاقه‌مندی‌های من',
  HELP = 'help',
  BACK_TO_MAIN = 'بازگشت به منوی اصلی',
  SIMPLE_SEARCH = '🔍 جستجوی محصول',
  ADVANCED_SEARCH = '🔬 جستجوی پیشرفته',
  CANCEL_SEARCH = 'لغو جستجو',
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
  ERROR_CATEGORY_SHOW = 'خطایی در هنگام نمایش دسته‌بندی‌ها رخ داد',
  PRODUCT_MOVING_PAGES = 'جابجایی بین صفحات',
  ERROR_GENERAL = 'خطا در پردازش اطلاعات',
  NO_PRODUCTS = 'هیچ محصولی یافت نشد',
  NO_CATEGORIES = 'هیچ دسته‌بندی یافت نشد',
  NO_PRODUCTS_IN_CATEGORY = 'هیچ محصولی در این دسته‌بندی وجود ندارد',
  NO_ORDERS = 'شما هیچ سفارشی ندارید',
  NO_FAVORITES = 'شما هیچ محصولی را به علاقه‌مندی‌ها اضافه نکرده‌اید',
  ORDER_CANCELLED = 'سفارش با موفقیت لغو شد',
  ERROR_ORDER_CANCEL = 'خطا در لغو سفارش',
  PRODUCT_ADDED_TO_FAVORITES = 'محصول به علاقه‌مندی‌ها اضافه شد',
  PRODUCT_REMOVED_FROM_FAVORITES = 'محصول از علاقه‌مندی‌ها حذف شد',
  ERROR_FAVORITE_ACTION = 'خطا در انجام عملیات علاقه‌مندی',
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
  ADD_TO_FAVORITES: '❤️ افزودن به علاقه‌مندی‌ها',
  REMOVE_FROM_FAVORITES: '❌ حذف از علاقه‌مندی‌ها',
  VIEW_PRODUCT: 'مشاهده کامل',
  VIEW_CATEGORY_PRODUCTS: '📦 مشاهده محصولات',
  CANCEL_ORDER: '❌ لغو سفارش',
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
    [TelegramHears.BROWSE_CATEGORIES, TelegramHears.BROWSE_PRODUCTS],
    ['🔍 جستجوی تکی', '🔬 جستجوی پیشرفته'],
    [TelegramHears.MY_FAVORITES, '🛒 سبد خرید'],
    [TelegramHears.BACK_TO_MAIN],
  ],
  BUYER_MENU: [
    [TelegramHears.BROWSE_CATEGORIES, TelegramHears.BROWSE_PRODUCTS],
    ['🔍 جستجوی محصول', '🔬 جستجوی پیشرفته'],
    [TelegramHears.MY_FAVORITES, TelegramHears.MY_ORDERS],
    [TelegramHears.BACK_TO_MAIN],
  ],
} as const;
