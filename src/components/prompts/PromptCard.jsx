import CategoryBadge from "../ui/CategoryBadge";
import CopyButton from "../ui/CopyButton";
import { DeleteIcon, UsageIcon, DateIcon, ChevronRightIcon } from "../ui/icons";

/**
 * 提示词卡片组件
 */
function PromptCard({ prompt, onCopy, onClick, onDelete }) {
  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer relative"
      onClick={() => onClick(prompt)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">
            {prompt.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge
              categorySlug={prompt.categorySlug}
              categoryName={prompt.categoryName}
            />
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
              {prompt.model}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <CopyButton text={prompt.content} onCopy={() => onCopy(prompt.id)} />
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="删除"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{prompt.content}</p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <UsageIcon />
            {prompt.usageCount} 次
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <DateIcon />
            {new Date(prompt.createdAt).toLocaleDateString("zh-CN")}
          </span>
        </div>
        <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors flex items-center gap-1">
          查看详情
          <ChevronRightIcon />
        </span>
      </div>
    </div>
  );
}

export default PromptCard;
