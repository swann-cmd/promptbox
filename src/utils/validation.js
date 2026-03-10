import { MAX_TITLE_LENGTH, MAX_CONTENT_LENGTH } from "../constants/app.js";

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
