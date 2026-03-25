import PropTypes from "prop-types";
import { TrashIcon, InfoIcon, WarningIcon, CheckIcon } from "../icons";

/**
 * 统一的对话框组件
 * 支持 info、success、warning、error、confirm 等类型
 */
function Dialog({ isOpen, title, message, type = "info", onConfirm, onCancel, confirmText = "确定", cancelText = "取消" }) {
  if (!isOpen) return null;

  // 配置映射
  const configs = {
    info: {
      icon: <InfoIcon />,
      bgClass: "bg-blue-100",
      iconColor: "text-blue-500",
      showCancel: false,
      confirmColor: "bg-blue-500 hover:bg-blue-600"
    },
    success: {
      icon: <CheckIcon />,
      bgClass: "bg-green-100",
      iconColor: "text-green-500",
      showCancel: false,
      confirmColor: "bg-green-500 hover:bg-green-600"
    },
    warning: {
      icon: <WarningIcon />,
      bgClass: "bg-orange-100",
      iconColor: "text-orange-500",
      showCancel: false,
      confirmColor: "bg-orange-500 hover:bg-orange-600"
    },
    error: {
      icon: <WarningIcon />,
      bgClass: "bg-red-100",
      iconColor: "text-red-500",
      showCancel: false,
      confirmColor: "bg-red-500 hover:bg-red-600"
    },
    confirm: {
      icon: <TrashIcon />,
      bgClass: "bg-red-100",
      iconColor: "text-red-500",
      showCancel: true,
      confirmColor: "bg-red-500 hover:bg-red-600",
      cancelColor: "border border-gray-200 text-gray-600 hover:bg-gray-50"
    }
  };

  const config = configs[type] || configs.info;

  // 类型检查：确保 onConfirm 和 onCancel 是函数（如果提供）
  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-bgSecondary rounded-3xl shadow-2xl w-full max-w-sm p-6">
        {/* Icon */}
        <div className={`w-12 h-12 ${config.bgClass} rounded-full flex items-center justify-center mx-auto mb-4`}>
          <span className={config.iconColor}>
            {config.icon}
          </span>
        </div>

        {/* Title and Message */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2 text-center">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-dark-textSecondary mb-6 text-center">{message}</p>

        {/* Buttons */}
        <div className={config.showCancel ? "flex gap-3" : ""}>
          {config.showCancel && (
            <button
              onClick={handleCancel}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${config.cancelColor}`}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`${config.showCancel ? "flex-1" : "w-full"} py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${config.confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

Dialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error', 'confirm']),
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

Dialog.defaultProps = {
  type: 'info',
  onConfirm: null,
  onCancel: null,
  confirmText: '确定',
  cancelText: '取消',
};

export default Dialog;
