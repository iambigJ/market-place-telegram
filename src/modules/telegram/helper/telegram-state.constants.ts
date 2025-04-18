/**
 * Enum for user conversation states
 */
export enum ConversationState {
  IDLE = 'idle',
  SEARCH_WAITING_QUERY = 'search_waiting_query',
  SEARCH_RESULTS = 'search_results',
  ADVANCED_SEARCH_NAME = 'advanced_search_name',
  ADVANCED_SEARCH_CATEGORY = 'advanced_search_category',
  ADVANCED_SEARCH_PRICE_MIN = 'advanced_search_price_min',
  ADVANCED_SEARCH_PRICE_MAX = 'advanced_search_price_max',
  ADVANCED_SEARCH_RESULTS = 'advanced_search_results',
}

/**
 * Cache prefix for user conversation state
 */
export enum StateCachePrefix {
  USER_STATE = 'user_state',
}

/**
 * Interface for user state data stored in cache
 */
export interface UserStateData {
  state: ConversationState;
  data: {
    searchQuery?: string;
    advancedSearch?: {
      name?: string;
      category?: string;
      priceMin?: number;
      priceMax?: number;
    };
    [key: string]: any;
  };
  lastUpdated: number;
}

/**
 * Messages for state management interactions
 */
export enum StateMessages {
  SEARCH_PROMPT = 'لطفا عبارت جستجو را وارد کنید:',
  ADVANCED_SEARCH_NAME_PROMPT = 'لطفا نام محصول مورد نظر را وارد کنید (یا - برای رد کردن):',
  ADVANCED_SEARCH_CATEGORY_PROMPT = 'لطفا دسته‌بندی مورد نظر را وارد کنید (یا - برای رد کردن):',
  ADVANCED_SEARCH_PRICE_MIN_PROMPT = 'لطفا حداقل قیمت را وارد کنید (به تومان، یا - برای رد کردن):',
  ADVANCED_SEARCH_PRICE_MAX_PROMPT = 'لطفا حداکثر قیمت را وارد کنید (به تومان، یا - برای رد کردن):',
  SEARCH_CANCEL = 'جستجو لغو شد.',
  INVALID_PRICE = 'لطفا یک عدد معتبر وارد کنید یا - برای رد کردن این مرحله.',
  SEARCH_RESULTS = 'نتایج جستجو برای: ',
  NO_RESULTS = 'هیچ نتیجه‌ای برای جستجوی شما یافت نشد.',
  SEARCH_PROCESSING = 'در حال پردازش جستجو...',
}

/**
 * Create a cache key for user state
 * @param userId Telegram user ID
 * @returns Cache key string
 */
export function createUserStateKey(userId: string): string {
  return `${StateCachePrefix.USER_STATE}.${userId}`;
}

/**
 * Telegram text for search and advanced search
 */
export const SEARCH_COMMANDS = {
  SIMPLE_SEARCH: '🔍 جستجوی محصول',
  ADVANCED_SEARCH: '🔬 جستجوی پیشرفته',
  CANCEL_SEARCH: 'لغو جستجو',
};
