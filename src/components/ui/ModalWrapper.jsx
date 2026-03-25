import CloseButton from "./CloseButton";

/**
 * Reusable modal wrapper component
 */
function ModalWrapper({ isOpen, onClose, title, size = "md", children, headerContent, showHeader = true }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-dark-bgSecondary rounded-3xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {showHeader && (
          /* Header */
          <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-50 dark:border-dark-border">
            <div className="flex items-center justify-between">
              {title && <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">{title}</h2>}
              <div className="flex items-center gap-2">
                {headerContent}
                <CloseButton onClick={onClose} />
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

export default ModalWrapper;
