import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { MODELS } from "../../constants/app";
import { PROMPT_TEMPLATES, getTemplatesByCategory, getTemplateCategories } from "../../constants/templates";
import { CloseIcon, DocumentIcon } from "../ui/icons";
import { sanitizeInput } from "../../utils/sanitize";
import { useTagManager } from "../../hooks/useTagManager";

/**
 * 添加提示词模态框组件（支持从模板创建）
 */
function AddPromptModal({ onClose, onAdd, categories }) {
  const [mode, setMode] = useState("manual"); // manual | template
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateCategory, setTemplateCategory] = useState("all");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    categoryId: "",
    model: "通用",
    tags: []
  });
  const [submitting, setSubmitting] = useState(false);

  // 使用统一的标签管理 hook
  const {
    tags,
    setTags,
    tagInput,
    setTagInput,
    addTag,
    removeTag,
    handleKeyDown,
    canAddMore,
    remaining
  } = useTagManager(form.tags);

  // 同步 tags 到 form state
  useEffect(() => {
    setForm(prev => ({ ...prev, tags }));
  }, [tags]);

  // 根据模板分类和搜索词筛选模板
  const filteredTemplates = useMemo(() => {
    let templates = getTemplatesByCategory(templateCategory);

    // 应用搜索过滤
    if (templateSearchQuery.trim()) {
      const lowerQuery = templateSearchQuery.toLowerCase();
      templates = templates.filter(t =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.content.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return templates;
  }, [templateCategory, templateSearchQuery]);

  // 获取预定义的模板分类列表（而非用户分类）
  const templateCategories = useMemo(() => {
    return getTemplateCategories();
  }, []);

  // 缓存模板摘要，避免每次渲染都 substring（性能优化）
  const templatesWithPreview = useMemo(() => {
    return filteredTemplates.map(template => ({
      ...template,
      preview: template.content.substring(0, 100)
    }));
  }, [filteredTemplates]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;

    setSubmitting(true);
    try {
      await onAdd(form);
      onClose();
    } catch (error) {
      console.error("添加失败:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // 应用模板
  const applyTemplate = (template) => {
    setSelectedTemplate(template);

    // 更健壮的分类匹配：先尝试 slug 匹配，再尝试名称匹配，最后使用第一个分类作为默认值
    const matchedCategory = categories.find(c => c.slug === template.category) ||
                            categories.find(c => c.name === template.categoryName) ||
                            categories[0];

    // 对模板内容进行安全清理，防止 XSS 攻击
    const sanitizedTags = sanitizeInput(template.tags?.join(", ") || "", 500).split(",").map(t => t.trim()).filter(Boolean);
    setForm({
      title: sanitizeInput(template.title, 200),
      content: sanitizeInput(template.content, 10000),
      categoryId: matchedCategory?.id || "",
      model: template.model,
      tags: sanitizedTags
    });
    setTags(sanitizedTags);
    setMode("manual");
  };

  // 撤销模板选择
  const resetTemplateSelection = () => {
    setSelectedTemplate(null);
    setForm({
      title: "",
      content: "",
      categoryId: "",
      model: "通用",
      tags: []
    });
    setTags([]);
    setTagInput("");
    setMode("template");
  };

  const isFormValid = form.title.trim() && form.content.trim() && form.categoryId;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bgSecondary rounded-3xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-dark-text">添加 Prompt</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 dark:bg-dark-bg rounded-xl p-1 mb-5">
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === "manual" ? "bg-white dark:bg-dark-bgSecondary text-gray-900 dark:text-dark-text shadow-sm" : "text-gray-500 dark:text-dark-textSecondary hover:text-gray-700 dark:hover:text-dark-text"
            }`}
          >
            手动创建
          </button>
          <button
            onClick={() => setMode("template")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === "template" ? "bg-white dark:bg-dark-bgSecondary text-gray-900 dark:text-dark-text shadow-sm" : "text-gray-500 dark:text-dark-textSecondary hover:text-gray-700 dark:hover:text-dark-text"
            }`}
          >
            从模板创建
          </button>
        </div>

        {/* Manual Mode */}
        {mode === "manual" && (
          <div className="space-y-4">
            {/* 撤销模板选择按钮 */}
            {selectedTemplate && (
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <DocumentIcon />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    已应用模板：<span className="font-semibold">{selectedTemplate.title}</span>
                  </span>
                </div>
                <button
                  onClick={resetTemplateSelection}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  重新选择
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">标题</label>
              <input
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-900 dark:text-dark-text bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="给这个 Prompt 起个名字"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">内容</label>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-900 dark:text-dark-text bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                placeholder="输入提示词内容..."
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">场景分类</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white dark:bg-dark-bg"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">选择分类</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">适用模型</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white dark:bg-dark-bg"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                >
                  {MODELS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 标签输入 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">标签 <span className="text-gray-400 dark:text-dark-textSecondary font-normal">(可选，最多 {canAddMore ? remaining : 0} 个)</span></label>

              {/* 标签列表 */}
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.tags.map((tag, index) => (
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
                  <span className="text-xs text-gray-400">
                    {form.tags.length}/10
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
              <p className="text-xs text-gray-400 mt-1.5">
                按回车或点击"添加"按钮添加标签，点击标签上的 × 删除
              </p>
            </div>
          </div>
        )}

        {/* Template Mode */}
        {mode === "template" && (
          <div className="space-y-4">
            {/* Category Filter - 使用预定义的模板分类 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">筛选分类</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
              >
                <option value="all">全部分类</option>
                {templateCategories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">搜索模板</label>
              <input
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                placeholder="搜索模板标题、内容或标签..."
                value={templateSearchQuery}
                onChange={(e) => setTemplateSearchQuery(e.target.value)}
              />
              {templateSearchQuery && (
                <p className="text-xs text-gray-500 dark:text-dark-textSecondary mt-1">
                  找到 {templatesWithPreview.length} 个结果
                </p>
              )}
            </div>

            {/* Template List */}
            <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {templatesWithPreview.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <DocumentIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text mb-0.5">{template.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-dark-textSecondary line-clamp-2">{template.preview}...</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-textSecondary">
                            {template.categoryName}
                          </span>
                          {template.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8">
                <DocumentIcon />
                <p className="text-sm text-gray-400 dark:text-dark-textSecondary mt-2">该分类暂无模板</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          {mode === "manual" && (
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "添加中..." : "添加"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

AddPromptModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  })).isRequired,
};

export default AddPromptModal;
