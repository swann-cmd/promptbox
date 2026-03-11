import { CloseIcon } from "./icons";

/**
 * Reusable modal wrapper component
 */
function ModalWrapper({ isOpen, onClose, title, size = "md", children, headerContent }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-3xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
          <div className="flex items-center justify-between">
            {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
            <div className="flex items-center gap-2">
              {headerContent}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

export default ModalWrapper;
