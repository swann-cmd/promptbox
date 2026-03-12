import { useState } from "react";
import PropTypes from "prop-types";
import { HeartIcon } from "../ui/icons";
import { toggleLike } from "../../utils/community";

/**
 * 点赞按钮组件（含乐观更新）
 */
function LikeButton({ communityPromptId, initialLiked = false, initialLikeCount = 0, size = "md", onLikeChange }) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;

    // Optimistic update
    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    const rollbackState = { isLiked, likeCount };

    setIsLiked(newLiked);
    setLikeCount(newCount);

    setLoading(true);
    try {
      const data = await toggleLike(communityPromptId);
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
      // Notify parent of state change
      if (onLikeChange) {
        onLikeChange({ isLiked: data.isLiked, likeCount: data.likeCount });
      }
    } catch (error) {
      console.error("点赞操作失败:", error);
      // Rollback on error
      setIsLiked(rollbackState.isLiked);
      setLikeCount(rollbackState.likeCount);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-2.5 py-1.5 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-1.5",
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center rounded-lg transition-all duration-200 ${
        isLiked
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
      } ${sizeClasses[size]} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isLiked ? "取消点赞" : "点赞"}
    >
      <HeartIcon filled={isLiked} />
      <span className="font-medium">{likeCount}</span>
    </button>
  );
}

LikeButton.propTypes = {
  communityPromptId: PropTypes.string.isRequired,
  initialLiked: PropTypes.bool,
  initialLikeCount: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onLikeChange: PropTypes.func,
};

LikeButton.defaultProps = {
  initialLiked: false,
  initialLikeCount: 0,
  size: 'md',
  onLikeChange: null,
};

export default LikeButton;
