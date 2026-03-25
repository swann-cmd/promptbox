import { useState } from "react";
import { IMPORT_MAX_ROWS, IMPORT_MAX_FILE_SIZE } from "../../constants/app";
import { UploadIcon, DownloadIcon, InfoIcon } from "../ui/icons";
import { CloseButton } from "../ui";

/**
 * 导入提示词模态框组件
 */
function ImportModal({ onClose, onImport, onError }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [allData, setAllData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const downloadTemplate = () => {
    const template = `标题,提示词文案,分类
写作助手,你是一个专业的写作助手，请帮我润色这段文字,写作
代码审查,请审查以下代码，找出潜在的问题和改进建议,开发
翻译助手,请将以下文本翻译成英文，保持原意不变,写作
数据分析,请分析以下数据并提供可视化建议,数据`;

    const blob = new Blob(["\ufeff" + template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "prompts_template.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 重置状态
    setError("");
    setPreview([]);
    setAllData([]);

    // 校验文件大小
    if (selectedFile.size > IMPORT_MAX_FILE_SIZE) {
      setError("导入文件不能超过 4.5MB");
      setFile(selectedFile);
      return;
    }

    setFile(selectedFile);

    // Parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;

        // 检查空文件
        if (!text || text.trim().length === 0) {
          setError("CSV 文件为空");
          return;
        }

        const rows = parseCSV(text);

        // Skip header row, parse data
        const data = rows.slice(1).map((row) => {
          // Trim whitespace and quotes from fields
          const cleanField = (field) => {
            const cleaned = field.trim().replace(/^"|"$/g, "");
            // 防止 CSV 注入
            if (/^[=+\-@]/.test(cleaned)) {
              return "'" + cleaned;
            }
            return cleaned;
          };

          return {
            title: cleanField(row[0]) || "",
            content: cleanField(row[1]) || "",
            categoryName: cleanField(row[2]) || ""
          };
        }).filter((item) => item.title && item.content);

        // 校验数据条数
        if (data.length > IMPORT_MAX_ROWS) {
          setError(`每次导入数据不能超过 ${IMPORT_MAX_ROWS} 条，当前文件有 ${data.length} 条`);
          setAllData([]);
          setPreview([]);
          return;
        }

        setAllData(data);
        setPreview(data.slice(0, 10));
      } catch (parseError) {
        console.error("CSV 解析失败:", parseError);

        // 提供更友好的错误信息
        let errorMessage = parseError.message;

        // 根据错误类型提供具体建议
        if (errorMessage.includes("引号未闭合")) {
          errorMessage += "\n\n建议：检查包含逗号的字段是否用双引号包围。";
        } else if (errorMessage.includes("格式错误")) {
          errorMessage += "\n\n建议：确保文件是标准的 CSV 格式，字段用逗号分隔，如包含逗号请用双引号包围。";
        } else {
          errorMessage = `CSV 文件解析失败\n\n${errorMessage}\n\n建议：\n1. 下载模板文件查看正确格式\n2. 确保使用逗号分隔字段\n3. 包含逗号的字段用双引号包围\n4. 删除多余的空行`;
        }

        setError(errorMessage);
        setAllData([]);
        setPreview([]);
      }
    };
    reader.readAsText(selectedFile);
  };

  // Parse CSV with proper handling of quoted fields and detailed error reporting
  const parseCSV = (text) => {
    const lines = [];
    let currentLine = [];
    let currentField = "";
    let inQuotes = false;
    let lineNumber = 1;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        // Field separator
        currentLine.push(currentField);
        currentField = "";
      } else if (char === "\n" && !inQuotes) {
        // Line separator
        currentLine.push(currentField);
        if (currentLine.some((field) => field.trim())) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = "";
        lineNumber++;
      } else if (char === "\r" && nextChar === "\n" && !inQuotes) {
        // Windows line separator
        currentLine.push(currentField);
        if (currentLine.some((field) => field.trim())) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = "";
        lineNumber++;
        i++;
      } else if (char !== "\r") {
        // 忽略单独的 \r 字符
        currentField += char;
      }
    }

    // 检查未闭合的引号
    if (inQuotes) {
      throw new Error(`第 ${lineNumber} 行：引号未闭合。请确保每个引号都有对应的闭合引号。`);
    }

    // Last line
    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField);
      if (currentLine.some((field) => field.trim())) {
        lines.push(currentLine);
      }
    }

    return lines;
  };

  const handleImport = async () => {
    if (!file || allData.length === 0) return;

    setImporting(true);
    try {
      await onImport(allData);
      onClose();
    } catch (error) {
      console.error("导入失败:", error);
      if (onError) onError("导入失败", error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bgSecondary rounded-3xl shadow-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-dark-text">导入 Prompts</h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-2xl p-8 text-center hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UploadIcon />
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-dark-text">点击上传 CSV 文件</p>
            </label>
            {file && <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">已选择：{file.name}</p>}
          </div>

          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-dark-text text-sm font-medium rounded-xl transition-colors"
          >
            <DownloadIcon />
            下载导入模板
          </button>

          {/* Import Limits */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <InfoIcon />
              <div className="text-xs text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">导入提醒</p>
                <p>• 支持格式：CSV（标题,提示词文案,分类）</p>
                <p>
                  • 每次可同时导入 <span className="font-semibold">{IMPORT_MAX_ROWS}</span> 条数据
                </p>
                <p>
                  • 附件不能超过 <span className="font-semibold">{(IMPORT_MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB</span>
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary mb-2">
                预览（前 10 条，共 {allData.length} 条）
              </p>
              <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-dark-bg">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-dark-textSecondary">标题</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-dark-textSecondary">提示词文案</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-dark-textSecondary">分类</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {preview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-bg">
                        <td className="px-3 py-2 text-gray-900 dark:text-dark-text max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="px-3 py-2 text-gray-500 dark:text-dark-textSecondary max-w-xs truncate">
                          {item.content}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {item.categoryName || "未分类"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm font-medium text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!file || preview.length === 0 || importing}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {importing ? "导入中..." : `导入 ${allData.length} 条`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
