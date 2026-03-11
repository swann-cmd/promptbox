import { useState } from "react";
import { CloseIcon, DownloadIcon } from "../ui/icons";
import { sanitizeCSVField } from "../../utils/sanitize";

/**
 * 导出提示词模态框组件
 */
function ExportModal({ onClose, prompts, categories, onError }) {
  const [format, setFormat] = useState("csv");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [exporting, setExporting] = useState(false);

  // 过滤 prompts
  const filteredPrompts = selectedCategory === "all"
    ? prompts
    : prompts.filter(p => p.categorySlug === selectedCategory);

  const handleExport = async () => {
    if (filteredPrompts.length === 0) {
      if (onError) onError("导出失败", "没有可导出的数据");
      return;
    }

    setExporting(true);
    try {
      let content = "";
      let filename = "";
      let mimeType = "";

      switch (format) {
        case "csv":
          content = exportToCSV();
          filename = `prompts_export_${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = "text/csv;charset=utf-8;";
          break;

        case "json":
          content = exportToJSON();
          filename = `prompts_export_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = "application/json;charset=utf-8;";
          break;

        case "markdown":
          content = exportToMarkdown();
          filename = `prompts_export_${new Date().toISOString().split('T')[0]}.md`;
          mimeType = "text/markdown;charset=utf-8;";
          break;

        default:
          throw new Error("不支持的导出格式");
      }

      // 创建并下载文件
      const blob = new Blob(['\ufeff' + content], { type: mimeType });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      // 延迟释放 URL，确保下载完成
      setTimeout(() => URL.revokeObjectURL(link.href), 100);

      onClose();
    } catch (error) {
      console.error("导出失败:", error);
      if (onError) onError("导出失败", error.message);
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    const headers = "标题,提示词文案,分类,模型,使用次数,创建时间";
    const rows = filteredPrompts.map(p => {
      // 安全处理字段 - 防止 CSV 注入和空值
      const escapeField = (field) => {
        if (field === null || field === undefined) return '""';

        // 先使用 sanitizeCSVField 防止注入
        const sanitized = sanitizeCSVField(String(field));

        // 处理逗号和引号
        const escaped = sanitized.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      return [
        escapeField(p.title),
        escapeField(p.content),
        escapeField(p.categoryName || ''),
        escapeField(p.model),
        escapeField(p.usageCount || 0),
        escapeField(p.createdAt ? new Date(p.createdAt).toLocaleDateString('zh-CN') : '')
      ].join(",");
    });

    return [headers, ...rows].join("\n");
  };

  const exportToJSON = () => {
    const data = filteredPrompts.map(p => ({
      title: p.title || "",
      content: p.content || "",
      category: p.categoryName || "未分类",
      model: p.model || "通用",
      usageCount: p.usageCount || 0,
      createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString('zh-CN') : ""
    }));

    return JSON.stringify(data, null, 2);
  };

  const exportToMarkdown = () => {
    const lines = [];
    lines.push("# PromptBox 导出");
    lines.push(`导出时间：${new Date().toLocaleString('zh-CN')}`);
    lines.push(`总计：${filteredPrompts.length} 条提示词\n`);

    // Markdown 特殊字符转义函数
    const escapeMarkdown = (text) => {
      if (!text) return "";
      // 转义标题中的特殊字符
      return String(text)
        .replace(/\*/g, '\\*')  // 星号
        .replace(/_/g, '\\_')   // 下划线
        .replace(/#/g, '\\#')   // 井号
        .replace(/\[/g, '\\[')  // 左方括号
        .replace(/\]/g, '\\]')  // 右方括号
        .replace(/\(/g, '\\(')  // 左圆括号
        .replace(/\)/g, '\\)'); // 右圆括号
    };

    filteredPrompts.forEach((p, index) => {
      const safeTitle = escapeMarkdown(p.title || "无标题");
      lines.push(`## ${index + 1}. ${safeTitle}`);
      lines.push("");
      lines.push(`**分类**: ${p.categoryName || '未分类'}  |  **模型**: ${p.model || '通用'}  |  **使用次数**: ${p.usageCount || 0}`);
      lines.push("");
      lines.push("### 提示词内容");
      lines.push("```");
      lines.push(p.content || "");
      lines.push("```");
      lines.push("");
    });

    return lines.join("\n");
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">导出 Prompts</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* 导出统计 */}
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <DownloadIcon />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">导出预览</p>
                <p>当前可导出 <span className="font-semibold">{filteredPrompts.length}</span> 条提示词</p>
              </div>
            </div>
          </div>

          {/* 分类筛选 */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">筛选分类</label>
            <select
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">全部分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* 导出格式 */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">导出格式</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'csv', label: 'CSV', desc: '表格数据' },
                { value: 'json', label: 'JSON', desc: '结构化数据' },
                { value: 'markdown', label: 'Markdown', desc: '文档格式' }
              ].map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setFormat(fmt.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    format === fmt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs font-semibold mb-0.5">{fmt.label}</div>
                  <div className="text-xs text-gray-500">{fmt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 格式说明 */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
            <p className="font-medium mb-1">格式说明：</p>
            <ul className="space-y-0.5 ml-4">
              <li>• <strong>CSV</strong>：适合 Excel 编辑，与导入格式兼容</li>
              <li>• <strong>JSON</strong>：适合程序处理，便于数据迁移</li>
              <li>• <strong>Markdown</strong>：适合阅读和文档分享</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">取消</button>
          <button
            onClick={handleExport}
            disabled={exporting || filteredPrompts.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {exporting ? "导出中..." : `导出 ${filteredPrompts.length} 条`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportModal;
