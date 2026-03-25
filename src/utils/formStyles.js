/**
 * 统一的表单样式类名
 * 用于保持整个应用的表单输入样式一致
 */

/**
 * 基础输入框样式（暗色模式支持）
 */
export const inputBaseClasses =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-900 dark:text-dark-text bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

/**
 * 基础输入框样式（无背景色，用于已有背景的容器）
 */
export const inputBaseClassesNoBg =
  "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

/**
 * Textarea 样式（带 resize 控制）
 */
export const textareaClasses = `${inputBaseClasses} resize-none`;

/**
 * Select 样式
 */
export const selectClasses = inputBaseClasses;

/**
 * 获取带禁用状态的输入框类名
 * @param {boolean} disabled - 是否禁用
 * @returns {string} 完整的类名
 */
export function getInputClasses(disabled = false) {
  return disabled
    ? `${inputBaseClasses} disabled:bg-gray-100 dark:disabled:bg-dark-bgSecondary disabled:cursor-not-allowed`
    : inputBaseClasses;
}

/**
 * 获取标签样式
 */
export const labelClasses = "text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5";

/**
 * 表单错误状态样式
 */
export const errorBorderClasses = "border-red-500 focus:ring-red-500/20 focus:border-red-400";

/**
 * 表单成功状态样式
 */
export const successBorderClasses = "border-green-500 focus:ring-green-500/20 focus:border-green-400";
