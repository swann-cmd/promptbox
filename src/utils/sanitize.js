/**
 * 输入清理函数 - 防止 XSS 攻击
 * @param {string} input - 需要清理的输入
 * @param {number} maxLength - 最大长度限制
 * @returns {string} 清理后的安全字符串
 */
export function sanitizeInput(input, maxLength = 10000) {
  if (typeof input !== "string") return "";

  // 移除危险字符（防止脚本注入）
  const cleaned = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // 移除 script 标签
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // 移除 iframe 标签
    .replace(/javascript:/gi, "") // 移除 javascript: 协议
    .replace(/on\w+\s*=/gi, ""); // 移除事件处理器（如 onclick=）

  // 限制长度
  return cleaned.slice(0, maxLength).trim();
}

/**
 * CSV 字段清理 - 防止 CSV 注入
 * @param {string} field - 需要清理的字段
 * @returns {string} 清理后的安全字符串
 */
export function sanitizeCSVField(field) {
  const cleaned = field.trim().replace(/^"|"$/g, "");

  // 防止 CSV 注入 - 检查是否以危险字符开头 (=, +, -, @)
  if (/^[=+\-@]/.test(cleaned)) {
    return "'" + cleaned; // 前缀单引号阻止公式执行
  }

  return cleaned;
}
