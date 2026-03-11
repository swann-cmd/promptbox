import { WarningIcon, CheckIcon } from "../icons";

/**
 * 警告对话框组件
 * @param {string} type - 'success' | 'warning' | 'error'
 */
function AlertDialog({ isOpen, title, message, onConfirm, confirmText = "确定", type = "warning" }) {
  if (!isOpen) return null;

  // 根据类型设置图标和颜色
  const getConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckIcon />,
          bgClass: "bg-green-100",
          iconColor: "text-green-500"
        };
      case "error":
        return {
          icon: <WarningIcon />,
          bgClass: "bg-red-100",
          iconColor: "text-red-500"
        };
      default:
        return {
          icon: <WarningIcon />,
          bgClass: "bg-red-100",
          iconColor: "text-red-500"
        };
    }
  };

  const config = getConfig();

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
        <div className={`w-12 h-12 ${config.bgClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <span className={config.iconColor}>
            {config.icon}
          </span>
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
