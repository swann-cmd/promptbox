import { useState } from "react";
import CategoryBadge from "../ui/CategoryBadge";
import CopyButton from "../ui/CopyButton";
import { CloseIcon, EditIcon, UsageIcon, DateIcon } from "../ui/icons";

/**
 * 提示词详情模态框组件
 */
function DetailModal({ prompt, onClose, onCopy, onUpdate, categories, models, onError }) {
  if (!prompt) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: prompt.title,
    content: prompt.content,
    categoryId: prompt.categoryId,
    model: prompt.model
  });
  const [saving, setSaving] = useState(false);

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
    setForm({
      title: prompt.title,
      content: prompt.content,
      categoryId: prompt.categoryId,
      model: prompt.model
    });
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  className="w-full text-lg font-semibold text-gray-900 leading-snug mb-2.5 border-b-2 border-blue-500 focus:outline-none pb-1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="提示词标题"
                />
              ) : (
                <h2 className="text-lg font-semibold text-gray-900 leading-snug mb-2.5">
                  {prompt.title}
                </h2>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
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
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
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
                    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full font-medium">
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
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="取消"
                  >
                    <CloseIcon />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.title.trim() || !form.content.trim()}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "保存中..." : "保存"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
                    title="编辑"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <CloseIcon />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "calc(85vh - 200px)" }}>
          {isEditing ? (
            <textarea
              className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 border-2 border-transparent focus:border-blue-400 transition-all"
              rows={12}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="输入提示词内容..."
            />
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {prompt.content}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEditing && (
          <div className="px-6 pb-6 pt-3 border-t border-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <UsageIcon />
                  使用 <span className="font-semibold text-gray-600">{prompt.usageCount}</span> 次
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <DateIcon />
                  {new Date(prompt.createdAt).toLocaleDateString("zh-CN")}
                </div>
              </div>
              <CopyButton text={prompt.content} onCopy={() => onCopy(prompt.id)} size="lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailModal;
