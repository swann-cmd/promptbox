/**
 * 统一的模态框样式类名
 */

/**
 * 模态框遮罩层样式
 */
export const modalOverlayClasses =
  "fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4";

/**
 * 模态框容器基础样式
 */
export const modalContainerBaseClasses =
  "bg-white dark:bg-dark-bgSecondary rounded-3xl shadow-2xl w-full overflow-hidden";

/**
 * 模态框尺寸映射
 */
export const modalSizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

/**
 * 获取模态框容器类名（包含尺寸）
 * @param {string} size - 模态框尺寸
 * @returns {string} 完整的容器类名
 */
export function getModalContainerClasses(size = "md") {
  return `${modalContainerBaseClasses} ${modalSizeClasses[size] || modalSizeClasses.md}`;
}

/**
 * 模态框头部样式
 */
export const modalHeaderClasses =
  "px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-50 dark:border-dark-border";

/**
 * 模态框内容区域样式
 */
export const modalContentClasses = "px-4 sm:px-6 py-4 sm:py-5";

/**
 * 模态框底部样式
 */
export const modalFooterClasses =
  "px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t border-gray-50 dark:border-dark-border";

/**
 * 模态框标题样式
 */
export const modalTitleClasses =
  "text-lg font-semibold text-gray-900 dark:text-dark-text";

/**
 * 模态框副标题样式
 */
export const modalSubtitleClasses =
  "text-base font-semibold text-gray-900 dark:text-dark-text";

/**
 * 获取带最大高度的滚动内容区域样式
 * @param {string} maxHeight - 最大高度（如 "calc(85vh - 320px)"）
 * @returns {string} 内容区域类名
 */
export function getScrollableContentClasses(maxHeight) {
  return `${modalContentClasses} overflow-y-auto`;
}
