/**
 * 集中的验证规则和限制常量
 * 统一管理所有输入验证规则
 */

// 字段长度限制
export const VALIDATION_LIMITS = {
  TITLE: {
    MIN: 1,
    MAX: 200,
    ERROR_MESSAGE: (length) => `标题不能超过 ${MAX_TITLE_LENGTH} 字符（当前：${length} 字符）`
  },
  CONTENT: {
    MIN: 1,
    MAX: 10000,
    ERROR_MESSAGE: (length) => `内容不能超过 ${MAX_CONTENT_LENGTH} 字符（当前：${length} 字符）`
  },
  TAG: {
    MIN: 1,
    MAX: 50,
    PATTERN: /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/,
    ERROR_MESSAGE: '标签只能包含字母、数字、中文、下划线和连字符'
  },
  DISPLAY_NAME: {
    MIN: 1,
    MAX: 100,
    ERROR_MESSAGE: '显示名称长度必须在 1-100 字符之间'
  },
  BIO: {
    MAX: 500,
    ERROR_MESSAGE: '个人简介不能超过 500 字符'
  },
  DESCRIPTION: {
    MAX: 500,
    ERROR_MESSAGE: '描述不能超过 500 字符'
  }
};

// 数组限制
export const ARRAY_LIMITS = {
  TAGS: {
    MAX_COUNT: 10,
    ERROR_MESSAGE: `最多只能添加 ${10} 个标签`
  },
  IMPORT: {
    MAX_ROWS: 500,
    ERROR_MESSAGE: `导入文件最多支持 ${500} 行数据`
  }
};

// 文件大小限制
export const FILE_LIMITS = {
  IMPORT_CSV: {
    MAX_SIZE: 4.5 * 1024 * 1024, // 4.5MB
    ERROR_MESSAGE: '导入文件大小不能超过 4.5MB'
  },
  AVATAR: {
    MAX_SIZE: 2 * 1024 * 1024, // 2MB
    ERROR_MESSAGE: '头像文件大小不能超过 2MB'
  }
};

// 速率限制
export const RATE_LIMITS = {
  API_CALL: {
    INTERVAL_MS: 2000,
    ERROR_MESSAGE: '操作过于频繁，请稍后再试'
  }
};

// 重试配置
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 2,
  DELAY_MS: 1000,
  BACKOFF_MULTIPLIER: 2
};

// 安全规则
export const SECURITY_RULES = {
  ALLOWED_HTML_TAGS: [], // 不允许任何 HTML 标签
  ALLOWED_URL_PROTOCOLS: ['http:', 'https:'],
  BLOCKED_PATTERNS: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /\s+on\w+\s*=/gi,
    /data:(?!image\/)/gi
  ]
};

// 导出便于使用的常量（向后兼容）
export const MAX_TITLE_LENGTH = VALIDATION_LIMITS.TITLE.MAX;
export const MAX_CONTENT_LENGTH = VALIDATION_LIMITS.CONTENT.MAX;
export const MAX_TAG_LENGTH = VALIDATION_LIMITS.TAG.MAX;
export const MAX_TAGS = ARRAY_LIMITS.TAGS.MAX_COUNT;
export const IMPORT_MAX_ROWS = ARRAY_LIMITS.IMPORT.MAX_ROWS;
export const IMPORT_MAX_FILE_SIZE = FILE_LIMITS.IMPORT_CSV.MAX_SIZE;
export const RATE_LIMIT_MS = RATE_LIMITS.API_CALL.INTERVAL_MS;
export const MAX_RETRIES = RETRY_CONFIG.MAX_ATTEMPTS;
