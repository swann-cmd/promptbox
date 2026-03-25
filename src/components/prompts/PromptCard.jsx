import { useMemo } from "react";
import PropTypes from "prop-types";
import CategoryBadge from "../ui/CategoryBadge";
import CopyButton from "../ui/CopyButton";
import { DeleteIcon, UsageIcon, DateIcon, ChevronRightIcon } from "../ui/icons";

/**
 * 提示词卡片组件
 */
function PromptCard({ prompt, onCopy, onClick, onDelete }) {
  // 缓存日期字符串，避免每次渲染都重新创建
  const dateString = useMemo(() =>
    new Date(prompt.createdAt).toLocaleDateString("zh-CN"),
    [prompt.createdAt]
  );

  return (
    <div
      className="group bg-white dark:bg-dark-bgSecondary rounded-2xl border border-gray-100 dark:border-dark-border p-5 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md dark:hover:shadow-none transition-all duration-300 cursor-pointer relative"
      onClick={() => onClick(prompt)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text text-sm leading-snug mb-2">
            {prompt.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge
              categorySlug={prompt.categorySlug}
              categoryName={prompt.categoryName}
            />
            <span className="text-xs text-gray-400 dark:text-dark-textSecondary bg-gray-50 dark:bg-dark-bg px-2 py-0.5 rounded-full">
              {prompt.model}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <CopyButton text={prompt.content} onCopy={() => onCopy(prompt.id)} />
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-1.5 rounded-lg text-gray-400 dark:text-dark-textSecondary hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="删除"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 dark:text-dark-textSecondary leading-relaxed line-clamp-2">{prompt.content}</p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-textSecondary">
            <UsageIcon />
            {prompt.usageCount} 次
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-textSecondary">
            <DateIcon />
            {dateString}
          </span>
        </div>
        <span className="text-xs text-gray-300 dark:text-dark-textSecondary group-hover:text-blue-400 dark:group-hover:text-blue-300 transition-colors flex items-center gap-1">
          查看详情
          <ChevronRightIcon />
        </span>
      </div>
    </div>
  );
}

PromptCard.propTypes = {
  prompt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    categorySlug: PropTypes.string.isRequired,
    categoryName: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    usageCount: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onCopy: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default PromptCard;
