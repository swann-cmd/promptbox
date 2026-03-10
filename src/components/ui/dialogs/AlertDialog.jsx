import { WarningIcon } from "../icons";

/**
 * 警告对话框组件
 */
function AlertDialog({ isOpen, title, message, onConfirm, confirmText = "确定" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <WarningIcon />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">{title}</h3>
        <p className="text-sm text-gray-600 mb-6 text-center">{message}</p>
        <button
          onClick={onConfirm}
          className="w-full py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}

export default AlertDialog;
