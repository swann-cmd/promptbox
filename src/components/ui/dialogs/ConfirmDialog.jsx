import { TrashIcon, InfoIcon } from "../icons";

/**
 * 确认对话框组件
 */
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = "确认删除", type = "danger" }) {
  if (!isOpen) return null;

  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className={`w-12 h-12 ${isDanger ? "bg-red-100" : "bg-blue-100"} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {isDanger ? <TrashIcon /> : <InfoIcon />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{title}</h3>
        <p className="text-sm text-gray-600 mb-6 text-center">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
              isDanger ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
