import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { sanitizeInput } from "../../utils/sanitize";
import { useTagManager, MAX_TAGS } from "../../hooks/useTagManager";
import { CloseButton } from "../ui";

/**
 * 发布到社区模态框
 */
function PublishModal({ prompt, onClose, onSuccess, onError }) {
  const [description, setDescription] = useState("");
  const [publishing, setPublishing] = useState(false);
  const {
    tags,
    setTags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleKeyDown,
    canAddMore,
  } = useTagManager();

  // 加载现有标签，并自动添加分类作为标签
  useEffect(() => {
    const initialTags = [];

    // 添加分类作为标签（如果存在）
    if (prompt?.categoryName) {
      initialTags.push(prompt.categoryName);
    }

    // 添加现有标签（排除重复的分类标签）
    if (prompt?.tags && Array.isArray(prompt.tags)) {
      prompt.tags.forEach(tag => {
        if (tag !== prompt?.categoryName && !initialTags.includes(tag)) {
          initialTags.push(tag);
        }
      });
    }

    // 限制最多10个标签
    setTags(initialTags.slice(0, MAX_TAGS));
  }, [prompt, setTags]);

  const handleSubmit = async () => {
    if (!prompt?.id) return;

    setPublishing(true);
    try {
      const sanitizedDescription = sanitizeInput(description, 500);
      const sanitizedTags = tags
        .map((tag) => sanitizeInput(tag.trim(), 50))
        .filter((tag) => tag.length > 0)
        .slice(0, MAX_TAGS);

      const { data, error } = await supabase.rpc("publish_to_community", {
        p_prompt_id: prompt.id,
        p_description: sanitizedDescription || null,
        p_tags: sanitizedTags.length > 0 ? sanitizedTags : null,
      });

      if (error) throw error;

      if (onSuccess) onSuccess(data);
    } catch (error) {
      console.error("发布失败:", error);
      if (onError) onError("发布失败", error.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-bgSecondary rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-50 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">发布到社区</h2>
            <CloseButton onClick={onClose} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Prompt Preview */}
          <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text mb-2">
              {prompt?.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-dark-textSecondary line-clamp-2">
              {prompt?.content}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-md">
                {prompt?.categoryName}
              </span>
              <span className="text-xs text-gray-400 dark:text-dark-textSecondary bg-gray-100 dark:bg-dark-bg px-2 py-0.5 rounded-md">
                {prompt?.model}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              描述 <span className="text-gray-400 dark:text-dark-textSecondary font-normal">(可选)</span>
            </label>
            <textarea
              className="w-full bg-gray-50 dark:bg-dark-bg rounded-xl p-3 text-sm text-gray-700 dark:text-dark-text leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 border-2 border-transparent focus:border-purple-400 transition-all placeholder-gray-400 dark:placeholder-dark-textSecondary"
              rows={3}
              placeholder="为您的提示词添加描述，帮助其他用户更好地理解..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400 dark:text-dark-textSecondary">
                {description.length}/500
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
              标签 <span className="text-gray-400 dark:text-dark-textSecondary font-normal">(可选，最多 10 个)</span>
            </label>

            {/* 标签列表 */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm rounded-lg group"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-purple-400 dark:text-purple-500 hover:text-purple-600 dark:hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* 标签输入框 */}
            <div className="relative">
              <input
                type="text"
                className="w-full bg-gray-50 dark:bg-dark-bg rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-textSecondary focus:outline-none focus:ring-2 focus:ring-purple-500/20 border-2 border-transparent focus:border-purple-400 transition-all pr-20"
                placeholder="输入标签后按回车添加"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!canAddMore}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-xs text-gray-400 dark:text-dark-textSecondary">
                  {tags.length}/{MAX_TAGS}
                </span>
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim() || !canAddMore}
                  className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-dark-textSecondary mt-1.5">
              按回车或点击"添加"按钮添加标签，点击标签上的 × 删除
            </p>
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <span className="font-semibold">提示：</span>
              发布后，您的提示词将出现在社区广场，其他用户可以浏览、点赞、收藏并复制使用。您随时可以撤回已发布的内容。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 border-t border-gray-50 dark:border-dark-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={publishing}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-dark-text hover:text-gray-800 dark:hover:text-dark-text transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={publishing}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-600 dark:hover:to-pink-600 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-purple-200 dark:shadow-none"
          >
            {publishing ? "发布中..." : "发布到社区"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublishModal;
