import PropTypes from 'prop-types';

/**
 * 按钮组件
 * 统一的按钮样式，支持多种变体和尺寸
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600',
    secondary: 'bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-700 disabled:bg-gray-50 dark:disabled:bg-dark-bgSecondary disabled:text-gray-400 dark:disabled:text-dark-textSecondary',
    ghost: 'bg-transparent text-gray-700 dark:text-dark-text hover:bg-gray-100 dark:hover:bg-gray-700 disabled:text-gray-400 dark:disabled:text-dark-textSecondary',
    danger: 'bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-700 disabled:bg-gray-300 dark:disabled:bg-gray-600',
    success: 'bg-green-500 text-white hover:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const baseClasses = 'rounded-xl font-medium transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
  className: PropTypes.string,
};
