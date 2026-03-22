/**
 * 输入清理和验证工具
 * 使用 DOMPurify 进行 XSS 防护
 */

import DOMPurify from 'dompurify';
import { MAX_TITLE_LENGTH, MAX_CONTENT_LENGTH } from "../constants/validation.js";

/**
 * 验证提示词内容长度
 * @throws {Error} 当标题或内容超过最大长度时抛出错误
 */
export function validatePrompt(title, content) {
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Error(`标题不能超过 ${MAX_TITLE_LENGTH} 字符（当前：${title.length} 字符）`);
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new Error(`内容不能超过 ${MAX_CONTENT_LENGTH} 字符（当前：${content.length} 字符）`);
  }
}

/**
 * 输入清理函数 - 防止 XSS 攻击
 * 使用 DOMPurify 提供更强的安全防护，并添加额外的文本模式清理
 * @param {string} input - 需要清理的输入
 * @param {number} maxLength - 最大长度限制
 * @returns {string} 清理后的安全字符串
 */
export function sanitizeInput(input, maxLength = 10000) {
  if (typeof input !== "string") return "";

  // 配置 DOMPurify: 移除所有 HTML 标签
  let clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // 不允许任何 HTML 标签
    ALLOWED_ATTR: [], // 不允许任何属性
    KEEP_CONTENT: true, // 保留文本内容
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });

  // 额外的文本模式清理（DOMPurify 只处理 HTML，不处理文本中的危险协议）
  clean = clean
    // 移除 javascript: 协议（处理大小写变体）
    .replace(/javascript:/gi, "")
    // 移除 data: 协议（除图片外）
    .replace(/data:(?!image\/)/gi, "")
    // 移除事件处理器（如 onclick=, onerror=, onload= 等）
    .replace(/\s+on\w+\s*=/gi, "");

  // 限制长度并去除首尾空格
  return clean.slice(0, maxLength).trim();
}

/**
 * CSV 字段清理 - 防止 CSV 注入
 * @param {string} field - 需要清理的字段
 * @returns {string} 清理后的安全字符串
 */
export function sanitizeCSVField(field) {
  if (typeof field !== "string") return "";

  const cleaned = field.trim().replace(/^"|"$/g, "");

  // 防止 CSV 注入 - 检查是否以危险字符开头 (=, +, -, @)
  if (/^[=+\-@]/.test(cleaned)) {
    return "'" + cleaned; // 前缀单引号阻止公式执行
  }

  return cleaned;
}

/**
 * HTML 内容清理（允许部分安全的 HTML 标签）
 * 用于需要显示富文本的场景
 * @param {string} html - HTML 内容
 * @param {Array<string>} allowedTags - 允许的 HTML 标签列表
 * @returns {string} 清理后的安全 HTML
 */
export function sanitizeHTML(html, allowedTags = ['p', 'br', 'strong', 'em', 'u', 'a']) {
  if (typeof html !== "string") return "";

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}
