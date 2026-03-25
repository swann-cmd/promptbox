import Dialog from "./Dialog";

/**
 * 警告对话框组件（向后兼容包装器）
 */
function AlertDialog(props) {
  return <Dialog {...props} />;
}

export default AlertDialog;
