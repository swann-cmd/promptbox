import PropTypes from 'prop-types';

/**
 * 表单输入框组件
 * 统一的表单输入样式
 */
export function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  ...props
}) {
  const inputClasses = error
    ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-400'
    : 'border-gray-200 dark:border-dark-border focus:ring-blue-500/20 focus:border-blue-400';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 dark:text-dark-text bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-100 dark:disabled:bg-dark-bgSecondary disabled:cursor-not-allowed ${inputClasses}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-400">{helperText}</p>
      )}
    </div>
  );
}

FormInput.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'url', 'number', 'tel']),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
};

/**
 * 表单文本域组件
 */
export function FormTextarea({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error,
  helperText,
  rows = 3,
  maxLength,
  className = '',
  ...props
}) {
  const inputClasses = error
    ? 'border-red-300 dark:border-red-700 focus:ring-red-500/20 focus:border-red-400'
    : 'border-gray-200 dark:border-dark-border focus:ring-blue-500/20 dark:focus:ring-blue-500/30 focus:border-blue-400 dark:focus:border-blue-500';

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {maxLength && (
          <span className="text-xs text-gray-400 dark:text-dark-textSecondary">
            {value?.length || 0} / {maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-gray-900 dark:text-dark-text bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 transition-all resize-none disabled:bg-gray-100 dark:disabled:bg-dark-bgSecondary disabled:cursor-not-allowed ${inputClasses}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-400 dark:text-dark-textSecondary">{helperText}</p>
      )}
    </div>
  );
}

FormTextarea.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  className: PropTypes.string,
};
