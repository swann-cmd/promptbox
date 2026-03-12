import { useState } from "react";
import { CheckSmallIcon, CopyIcon } from "./icons";

/**
 * 复制按钮组件
 * @param {string} text - 要复制的文本
 * @param {Function} onCopy - 复制成功后的回调
 * @param {string} size - 按钮尺寸 ("sm" | "lg")
 * @param {boolean} disabled - 是否禁用
 */
function CopyButton({ text, onCopy, size = "sm", disabled = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (disabled) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onCopy) await onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  const baseClasses = size === "lg"
    ? "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
    : "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200";

  const stateClasses = copied
    ? "bg-green-50 text-green-600"
    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700";

  return (
    <button
      onClick={handleCopy}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={copied ? "已复制" : "复制"}
    >
      {copied ? (
        <>
          <CheckSmallIcon />
          已复制
        </>
      ) : (
        <>
          <CopyIcon />
          复制
        </>
      )}
    </button>
  );
}

export default CopyButton;
