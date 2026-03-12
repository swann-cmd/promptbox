/**
 * 应用通用常量
 */

export const MODELS = ["通用", "ChatGPT", "Claude", "Gemini", "Midjourney", "Sora"];

export const MAX_TITLE_LENGTH = 200;
export const MAX_CONTENT_LENGTH = 10000;

export const APP_FONT = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif"
};

// 速率限制
export const RATE_LIMIT_MS = 2000;

// 导入限制
export const IMPORT_MAX_ROWS = 500;
export const IMPORT_MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB

// 标签限制
export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 50;

// 组件尺寸限制
export const MAX_RETRIES = 2;
