import PropTypes from 'prop-types';

/**
 * 搜索输入框组件
 * 统一的搜索框样式和交互
 */
export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = '搜索...',
  color = 'blue',
  className = '',
}) {
  const colorClasses = {
    blue: 'bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-500/20',
    purple: 'bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-500/20',
    gray: 'bg-gray-50 border-gray-200 focus:border-gray-400 focus:ring-gray-500/20',
  };

  const iconColor = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    gray: 'text-gray-400',
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor[color]}`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-11 pr-10 py-3 rounded-2xl border text-sm focus:outline-none focus:ring-2 transition-all ${colorClasses[color]}`}
      />
      {value && (
        <button
          onClick={() => {
            onClear?.();
            onChange('');
          }}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors`}
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  color: PropTypes.oneOf(['blue', 'purple', 'gray']),
  className: PropTypes.string,
};
