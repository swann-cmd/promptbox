import { useState } from "react";
import { IMPORT_MAX_ROWS, IMPORT_MAX_FILE_SIZE } from "../../constants/app";
import { CloseIcon, UploadIcon, DownloadIcon, InfoIcon } from "../ui/icons";

/**
 * 导入提示词模态框组件
 */
function ImportModal({ onClose, onImport, categories, onError }) {
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
        setError("CSV 文件格式错误：" + parseError.message);
        setAllData([]);
        setPreview([]);
      }
    };
    reader.readAsText(selectedFile);
  };

  // Parse CSV with proper handling of quoted fields
  const parseCSV = (text) => {
    const lines = [];
    let currentLine = [];
    let currentField = "";
    let inQuotes = false;

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
      } else if (char === "\r" && nextChar === "\n" && !inQuotes) {
        // Windows line separator
        currentLine.push(currentField);
        if (currentLine.some((field) => field.trim())) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = "";
        i++;
      } else if (char !== "\r") {
        // 忽略单独的 \r 字符
        currentField += char;
      }
    }

    // 检查未闭合的引号
    if (inQuotes) {
      throw new Error("CSV 格式错误：引号未闭合");
    }

    // Last line
    if (currentField || currentLine.length > 0) {
      currentLine.push(currentField);
      if (currentLine.some((field) => field.trim())) {
        lines.push(currentLine);
      }
    }

    // 检查是否只有标题行
    if (lines.length <= 1) {
      throw new Error("CSV 文件没有数据行（只有标题行）");
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">导入 Prompts</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-300 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <UploadIcon />
              </div>
              <p className="text-sm font-medium text-gray-700">点击上传 CSV 文件</p>
            </label>
            {file && <p className="text-xs text-blue-500 mt-2">已选择：{file.name}</p>}
          </div>

          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            <DownloadIcon />
            下载导入模板
          </button>

          {/* Import Limits */}
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <InfoIcon />
              <div className="text-xs text-blue-700">
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
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
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
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                预览（前 10 条，共 {allData.length} 条）
              </p>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">标题</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">提示词文案</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">分类</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900 max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="px-3 py-2 text-gray-500 max-w-xs truncate">
                          {item.content}
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">
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
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleImport}
            disabled={!file || preview.length === 0 || importing}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {importing ? "导入中..." : `导入 ${allData.length} 条`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
