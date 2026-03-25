import { CloseIcon } from "./icons";

/**
 * 统一的关闭按钮组件
 * 用于模态框、侧边栏等的关闭功能
 * @param {Function} onClick - 点击回调
 * @param {string} className - 额外的类名
 * @param {boolean} disabled - 是否禁用
 * @param {string} ariaLabel - 无障碍标签
 */
function CloseButton({ onClick, className = "", disabled = false, ariaLabel = "关闭" }) {
  const baseClasses = "w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${disabledClasses} ${className}`.trim()}
      aria-label={ariaLabel}
      type="button"
    >
      <CloseIcon />
    </button>
  );
}

export default CloseButton;
