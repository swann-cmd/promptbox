import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getToggleButtonClasses } from "../../utils/sizeClasses";
import { MAX_RETRIES } from "../../constants/app";

/**
 * 通用切换按钮组件
 * 支持 LikeButton、FavoriteButton 等切换功能
 * 包含乐观更新和自动重试机制
 */
function ToggleButton({
  icon,
  activeIcon,
  apiCall,
  initialState = false,
  count = 0,
  size = "md",
  activeColor = "red",
  onChange,
  title,
}) {
  const IconComponent = icon;
  const ActiveIcon = activeIcon;
  const [isActive, setIsActive] = useState(initialState);
  const [currentCount, setCurrentCount] = useState(count);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsActive(initialState);
  }, [initialState]);

  useEffect(() => {
    setCurrentCount(count);
  }, [count]);

  const handleClick = async () => {
    if (loading) return;

    // 乐观更新
    const newActive = !isActive;
    const newCount = newActive ? currentCount + 1 : currentCount - 1;
    const rollbackState = { isActive, count: currentCount };

    setIsActive(newActive);
    setCurrentCount(newCount);

    setLoading(true);
    let attempts = 0;
    const maxAttempts = MAX_RETRIES + 1; // 初始尝试 + 重试次数

    while (attempts < maxAttempts) {
      try {
        const data = await apiCall();
        setIsActive(data.isLiked ?? data.isFavorited ?? data.isActive ?? newActive);
        setCurrentCount(data.likeCount ?? data.count ?? newCount);

        // 通知父组件状态变化
        if (onChange && data.isLiked !== undefined) {
          onChange({ isLiked: data.isLiked, likeCount: data.likeCount });
        } else if (onChange && data.isFavorited !== undefined) {
          onChange({ isFavorited: data.isFavorited });
        }

        // 成功后重置重试计数
        break;
      } catch (error) {
        attempts++;
        console.error(`操作失败 (尝试 ${attempts}/${maxAttempts}):`, error);

        // 如果还有重试机会，继续重试
        if (attempts < maxAttempts) {
          // 等待一段时间后重试（指数退避）
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
          continue;
        }

        // 所有尝试都失败，回滚状态
        console.error("操作失败，已回滚状态");
        setIsActive(rollbackState.isActive);
        setCurrentCount(rollbackState.count);
      }
    }

    setLoading(false);
  };

  const colorClasses = {
    red: {
      active: "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50",
      inactive: "bg-gray-50 dark:bg-dark-bg text-gray-400 dark:text-dark-textSecondary hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-gray-500 dark:hover:text-dark-text"
    },
    amber: {
      active: "bg-amber-50 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50",
      inactive: "bg-gray-50 dark:bg-dark-bg text-gray-400 dark:text-dark-textSecondary hover:bg-gray-100 dark:hover:bg-dark-bg hover:text-gray-500 dark:hover:text-dark-text"
    }
  };

  const { container: containerSize, padding: paddingClass } = getToggleButtonClasses(size);

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center rounded-lg transition-all duration-200 ${
        isActive
          ? colorClasses[activeColor].active
          : colorClasses[activeColor].inactive
      } ${containerSize} ${paddingClass} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      title={title || (isActive ? "取消" : "确认")}
    >
      {ActiveIcon ? (
        <ActiveIcon filled={isActive} />
      ) : (
        <IconComponent filled={isActive} />
      )}
      {count !== null && count !== undefined && (
        <span className="font-semibold">{currentCount}</span>
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
