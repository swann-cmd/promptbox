import PropTypes from 'prop-types';

/**
 * 空状态组件
 * 统一的空数据状态显示
 */
export function EmptyState({
  icon,
  title,
  message,
  action,
  className = '',
}) {
  return (
    <div className={`text-center py-16 ${className}`}>
      {icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      {message && (
        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">{message}</p>
      )}
      {action}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  message: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};
