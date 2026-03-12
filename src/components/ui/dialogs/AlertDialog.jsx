import Dialog from "./Dialog";

/**
 * 警告对话框组件（向后兼容包装器）
 */
function AlertDialog({ isOpen, title, message, onConfirm, confirmText = "确定", type = "warning" }) {
  return Dialog({
    isOpen,
    title,
    message,
    type,
    onConfirm,
    confirmText
  });
}

export default AlertDialog;
