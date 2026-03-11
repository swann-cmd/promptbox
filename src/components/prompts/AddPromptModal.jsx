import { useState, useMemo } from "react";
import { MODELS } from "../../constants/app";
import { PROMPT_TEMPLATES, getTemplatesByCategory } from "../../constants/templates";
import { CloseIcon, DocumentIcon } from "../ui/icons";

/**
 * 添加提示词模态框组件（支持从模板创建）
 */
function AddPromptModal({ onClose, onAdd, categories }) {
  const [mode, setMode] = useState("manual"); // manual | template
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateCategory, setTemplateCategory] = useState("all");

  const [form, setForm] = useState({
    title: "",
    content: "",
    categoryId: "",
    model: "通用"
  });
  const [submitting, setSubmitting] = useState(false);

  // 根据模板分类筛选模板
  const filteredTemplates = useMemo(() => {
    return getTemplatesByCategory(templateCategory);
  }, [templateCategory]);

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

    setForm({
      title: template.title,
      content: template.content,
      categoryId: matchedCategory?.id || "",
      model: template.model
    });
    setMode("manual");
  };

  const isFormValid = form.title.trim() && form.content.trim() && form.categoryId;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">添加 Prompt</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
          <button
            onClick={() => setMode("manual")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === "manual" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            手动创建
          </button>
          <button
            onClick={() => setMode("template")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === "template" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            从模板创建
          </button>
        </div>

        {/* Manual Mode */}
        {mode === "manual" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">标题</label>
              <input
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="给这个 Prompt 起个名字"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">内容</label>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                placeholder="输入提示词内容..."
                rows={5}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">场景分类</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
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
                <label className="text-xs font-medium text-gray-500 block mb-1.5">适用模型</label>
                <select
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
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
          </div>
        )}

        {/* Template Mode */}
        {mode === "template" && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">筛选分类</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                value={templateCategory}
                onChange={(e) => setTemplateCategory(e.target.value)}
              >
                <option value="all">全部分类</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Template List */}
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <DocumentIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{template.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{template.content.substring(0, 100)}...</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                            {template.categoryName}
                          </span>
                          {template.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">
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
                <p className="text-sm text-gray-400 mt-2">该分类暂无模板</p>
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

export default AddPromptModal;
