export enum TelegramCommands {
  SHOW_PRODUCT = 'showproduct',
  START = 'start',
  QUIT = 'quit',
}

export enum TelegramHears {
  BUYER_MENU = 'منو فروشنده ها 👤',
  SELLER_MENU = 'منو خریداران 🛍️',
  TUTORIAL = 'اموزش استفاده 💬',
  RULES = 'قوانین و مقررات 📜',
  BROWSE_PRODUCTS = '📦 تمام محصولات',
  HELP = 'help',
  BACK_TO_MAIN = 'بازگشت به منوی اصلی',
}

export enum TelegramMessages {
  WELCOME_MAIN = 'به منوی اصلی خوش آمدید!',
  WELCOME_SELLER = '🏡 به منوی اصلی خوش آمدید!',
  ERROR_MENU = '⚠️ مشکلی در نمایش منو پیش آمد. لطفا دوباره امتحان کنید.',
  NOT_IMPLEMENTED = 'این ایتم هنوز پیاده سازی نشده است',
  BUYER_MENU_NOT_READY = 'این منو هنوز ساخته نشده است',
  ErrorProductShow = 'خطایی در هنگام نمایش محصولات رخ داد',
  ProductMovingPages = 'جابجایی بین صفحات',
  ErrorGenegral = 'خطا در پردازش اطلاعات',
}

export enum TelegramProductActions {
  ADD_TO_CART = 'add_to_cart_',
  ADD_TO_FAVORITES = 'add_to_favorites_',
  VIEW_PRODUCT = 'view_product_',
}

export const TelegramProductButtons = {
  ADD_TO_CART: '🛒 افزودن به سبد خرید',
  ADD_TO_FAVORITES: '❤️ علاقه‌مندی‌ها',
  VIEW_PRODUCT: 'مشاهده کامل',
} as const;

type KeyboardButton = string;
type KeyboardRow = KeyboardButton[];
type KeyboardLayout = KeyboardRow[];

export const TelegramKeyboards: Record<
  'MAIN_MENU' | 'SELLER_MENU',
  KeyboardLayout
> = {
  MAIN_MENU: [
    ['منو فروشنده ها 👤', 'منو خریداران 🛍️'],
    ['اموزش استفاده 💬', 'قوانین و مقررات 📜'],
  ],
  SELLER_MENU: [
    ['🗂️ تمام دسته بندی ها', '📦 تمام محصولات'],
    ['🔍 جستجوی تکی', '🔬 جستجوی پیشرفته'],
    ['❤️ علاقه مندی ها ', '🛒 سبد خرید'],
    ['بازگشت به منوی اصلی'],
  ],
} as const;
