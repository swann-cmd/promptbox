import Dialog from "./Dialog";

/**
 * 确认对话框组件（向后兼容包装器）
 */
function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = "确认删除" }) {
  return Dialog({
    isOpen,
    title,
    message,
    type: "confirm",
    onConfirm,
    onCancel,
    confirmText
  });
}

export default ConfirmDialog;
