import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CategoryBadge from "../ui/CategoryBadge";
import CopyButton from "../ui/CopyButton";
import PublishModal from "../community/PublishModal";
import AlertDialog from "../ui/dialogs/AlertDialog";
import { CloseIcon, EditIcon, UsageIcon, DateIcon, CommunityIcon, UndoIcon } from "../ui/icons";
import { useTagManager, MAX_TAGS } from "../../hooks/useTagManager";
import { withdrawCommunityPrompt } from "../../utils/community";

/**
 * 提示词详情模态框组件
 */
function DetailModal({ prompt: initialPrompt, onClose, onCopy, onUpdate, onPublishSuccess, onWithdrawSuccess, categories, models, onError }) {
  const hasPrompt = Boolean(initialPrompt);
  const safePrompt = initialPrompt || {
    id: "",
    title: "",
    content: "",
    categoryId: "",
    categorySlug: "",
    categoryName: "",
    model: "",
    tags: [],
    usageCount: 0,
    createdAt: "",
    updatedAt: "",
    isPublishedToCommunity: false,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [prompt, setPrompt] = useState(safePrompt);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: "", message: "", type: "warning" });
  const [form, setForm] = useState({
    title: safePrompt.title,
    content: safePrompt.content,
    categoryId: safePrompt.categoryId,
    model: safePrompt.model,
    tags: safePrompt.tags || []
  });
  const [saving, setSaving] = useState(false);

  const {
    tags,
    setTags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleKeyDown,
    canAddMore,
  } = useTagManager(safePrompt.tags || []);

  // 同步 tag 状态到 form
  useEffect(() => {
    setForm(prev => ({ ...prev, tags }));
  }, [tags]);

  // 当 initialPrompt 变化时，同步本地 prompt 状态
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // 当 prompt 更新时，同步表单数据
  useEffect(() => {
    setForm({
      title: prompt.title,
      content: prompt.content,
      categoryId: prompt.categoryId,
      model: prompt.model,
      tags: prompt.tags || []
    });
  }, [prompt.id, prompt.title, prompt.content, prompt.categoryId, prompt.model, prompt.tags]);

  if (!hasPrompt) return null;

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;

    setSaving(true);
    try {
      await onUpdate(prompt.id, form);
      setIsEditing(false);
    } catch (error) {
      console.error("更新失败:", error);
      if (onError) onError("更新失败", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const originalTags = prompt.tags || [];
    setTags(originalTags);
    setTagInput("");
    setForm({
      title: prompt.title,
      content: prompt.content,
      categoryId: prompt.categoryId,
      model: prompt.model,
      tags: originalTags
    });
    setIsEditing(false);
  };

  const handleWithdraw = async () => {
    if (!prompt.communityPromptId) {
      setAlertDialog({
        isOpen: true,
        title: "无法撤回",
        message: "该提示词未发布到社区或缺少社区ID",
        type: "error"
      });
      return;
    }

    setWithdrawing(true);
    try {
      await withdrawCommunityPrompt(prompt.communityPromptId);

      // 更新本地状态
      setPrompt(prev => ({
        ...prev,
        isPublishedToCommunity: false,
        communityPromptId: null
      }));

      // 刷新列表以更新所有提示词的发布状态
      if (onWithdrawSuccess) onWithdrawSuccess();

      setAlertDialog({
        isOpen: true,
        title: "撤回成功",
        message: "您的提示词已从社区广场撤回",
        type: "success"
      });
    } catch (error) {
      console.error("撤回失败:", error);
      setAlertDialog({
        isOpen: true,
        title: "撤回失败",
        message: error.message || "撤回发布失败，请稍后重试",
        type: "error"
      });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-bgSecondary rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-50 dark:border-dark-border flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  className="w-full text-lg font-semibold text-gray-900 dark:text-dark-text leading-snug mb-2.5 border-b-2 border-blue-500 focus:outline-none pb-1 bg-transparent"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="提示词标题"
                />
              ) : (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text leading-snug mb-2.5">
                  {prompt.title}
                </h2>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <select
                      className="text-xs border border-gray-200 dark:border-dark-border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="text-xs border border-gray-200 dark:border-dark-border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                    >
                      {models.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <CategoryBadge
                      categorySlug={prompt.categorySlug}
                      categoryName={prompt.categoryName}
                    />
                    <span className="text-xs text-gray-400 dark:text-dark-textSecondary bg-gray-50 dark:bg-dark-bg px-2.5 py-1 rounded-full font-medium">
                      {prompt.model}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    title="取消"
                  >
                    <CloseIcon />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.title.trim() || !form.content.trim()}
                    className="px-3 py-1.5 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "保存中..." : "保存"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    title="编辑"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                className="w-full bg-gray-50 dark:bg-dark-bg rounded-2xl p-4 text-sm text-gray-700 dark:text-dark-text leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 border-2 border-transparent focus:border-blue-400 transition-all"
                rows={8}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="输入提示词内容..."
              />

              {/* 标签编辑 */}
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-2">标签 <span className="text-gray-400 dark:text-dark-textSecondary font-normal">(可选，最多 10 个)</span></label>

                {/* 标签列表 */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg group"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all pr-20"
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
                      className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      添加
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-dark-bg rounded-2xl p-4">
                <p className="text-sm text-gray-700 dark:text-dark-text leading-relaxed whitespace-pre-wrap">
                  {prompt.content}
                </p>
              </div>

              {/* 显示标签 */}
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEditing && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t border-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-textSecondary">
                  <UsageIcon />
                  <span className="hidden sm:inline">使用</span> <span className="font-semibold text-gray-600 dark:text-dark-text">{prompt.usageCount}</span><span className="hidden sm:inline"> 次</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-dark-textSecondary">
                  <DateIcon />
                  {new Date(prompt.createdAt).toLocaleDateString("zh-CN")}
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {prompt.isPublishedToCommunity ? (
                  <>
                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawing}
                      className="flex items-center justify-center px-2 py-1.5 sm:px-4 sm:py-2.5 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-dark-text text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="撤回发布"
                    >
                      <UndoIcon />
                      <span className="hidden sm:inline">{withdrawing ? "撤回中..." : "撤回"}</span>
                    </button>
                    <div className="flex items-center gap-2 px-2 py-1.5 sm:px-4 sm:py-2.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium rounded-xl border border-green-200 dark:border-green-800">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="hidden sm:inline">已发布</span>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setShowPublishModal(true)}
                    className="flex items-center gap-1 px-2 py-1.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-xl transition-all shadow-sm shadow-purple-200"
                    title="发布到社区"
                  >
                    <CommunityIcon />
                    <span className="hidden sm:inline">发布到社区</span>
                  </button>
                )}
                <CopyButton
                  text={prompt.content}
                  onCopy={() => onCopy(prompt.id)}
                  onError={(title, message) => onError(title, message)}
                  size="lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishModal
          prompt={prompt}
          onClose={() => setShowPublishModal(false)}
          onSuccess={() => {
            setShowPublishModal(false);
            // 更新 prompt 的发布状态
            setPrompt(prev => ({ ...prev, isPublishedToCommunity: true }));
            // 刷新列表以更新所有提示词的发布状态
            if (onPublishSuccess) onPublishSuccess();
            setAlertDialog({
              isOpen: true,
              title: "发布成功",
              message: "您的提示词已成功发布到社区广场！",
              type: "success"
            });
          }}
          onError={(title, message) => {
            setAlertDialog({
              isOpen: true,
              title,
              message,
              type: "error"
            });
          }}
        />
      )}

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onConfirm={() => setAlertDialog({ isOpen: false, title: "", message: "", type: "warning" })}
      />
    </div>
  );
}

DetailModal.propTypes = {
  prompt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    categoryId: PropTypes.string.isRequired,
    categorySlug: PropTypes.string.isRequired,
    categoryName: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    usageCount: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    isPublishedToCommunity: PropTypes.bool,
    communityPromptId: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onPublishSuccess: PropTypes.func,
  onWithdrawSuccess: PropTypes.func,
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  })).isRequired,
  models: PropTypes.arrayOf(PropTypes.string).isRequired,
  onError: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string,
  }),
};

DetailModal.defaultProps = {
  prompt: null,
  onPublishSuccess: null,
  onWithdrawSuccess: null,
  user: null,
};

export default DetailModal;
