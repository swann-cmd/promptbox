import { useState } from "react";
import PropTypes from "prop-types";

/**
 * 通用切换按钮组件
 * 支持 LikeButton、FavoriteButton 等切换功能
 */
function ToggleButton({
  icon: Icon,
  activeIcon,
  apiCall,
  initialState = false,
  count = 0,
  size = "md",
  activeColor = "red",
  onChange,
  title,
  ...props
}) {
  const [isActive, setIsActive] = useState(initialState);
  const [currentCount, setCurrentCount] = useState(count);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;

    // 乐观更新
    const newActive = !isActive;
    const newCount = newActive ? currentCount + 1 : currentCount - 1;
    const rollbackState = { isActive, count: currentCount };

    setIsActive(newActive);
    setCurrentCount(newCount);

    setLoading(true);
    try {
      const data = await apiCall();
      setIsActive(data.isLiked ?? data.isFavorited ?? data.isActive);
      setCurrentCount(data.likeCount ?? data.count ?? currentCount);

      // 通知父组件状态变化
      if (onChange && data.isLiked !== undefined) {
        onChange({ isLiked: data.isLiked, likeCount: data.likeCount });
      } else if (onChange && data.isFavorited !== undefined) {
        onChange({ isFavorited: data.isFavorited });
      }
    } catch (error) {
      console.error("操作失败:", error);
      // 回滚
      setIsActive(rollbackState.isActive);
      setCurrentCount(rollbackState.count);
    } finally {
      setLoading(false);
    }
  };

  const colorClasses = {
    red: {
      active: "bg-red-50 text-red-500 hover:bg-red-100",
      inactive: "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
    },
    amber: {
      active: "bg-amber-50 text-amber-500 hover:bg-amber-100",
      inactive: "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
    }
  };

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    sm_padding: "px-2 py-1 text-xs gap-1",
    md: "w-8 h-8 text-sm",
    md_padding: "px-2.5 py-1.5 text-xs gap-1.5",
    lg: "w-9 h-9 text-base",
    lg_padding: "px-3 py-1.5 text-sm gap-1.5"
  };

  const paddingClass = size === "sm" || size === "md" || size === "lg"
    ? sizeClasses[`${size}_padding`]
    : sizeClasses.md_padding;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center rounded-lg transition-all duration-200 ${
        isActive
          ? colorClasses[activeColor].active
          : colorClasses[activeColor].inactive
      } ${sizeClasses[size] || sizeClasses.md} ${paddingClass} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      title={title || (isActive ? "取消" : "确认")}
    >
      {activeIcon ? (
        <activeIcon filled={isActive} />
      ) : (
        <Icon filled={isActive} />
      )}
      {count !== null && count !== undefined && (
        <span className="font-medium">{currentCount}</span>
      )}
    </button>
  );
}

ToggleButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  activeIcon: PropTypes.elementType,
  apiCall: PropTypes.func.isRequired,
  initialState: PropTypes.bool,
  count: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  activeColor: PropTypes.oneOf(['red', 'amber', 'blue']),
  onChange: PropTypes.func,
  title: PropTypes.string,
};

ToggleButton.defaultProps = {
  initialState: false,
  count: 0,
  size: 'md',
  activeColor: 'red',
  onChange: null,
  title: '',
};

export default ToggleButton;
