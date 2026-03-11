import { useState } from "react";
import { StarIcon } from "../ui/icons";
import { toggleFavorite } from "../../utils/community";

/**
 * 收藏按钮组件（含乐观更新）
 */
function FavoriteButton({ communityPromptId, initialFavorited = false, size = "md", onFavoriteChange }) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;

    // Optimistic update
    const newFavorited = !isFavorited;
    const rollbackValue = isFavorited;

    setIsFavorited(newFavorited);

    setLoading(true);
    try {
      const data = await toggleFavorite(communityPromptId);
      setIsFavorited(data.isFavorited);
      // Notify parent of state change
      if (onFavoriteChange) {
        onFavoriteChange({ isFavorited: data.isFavorited });
      }
    } catch (error) {
      console.error("收藏操作失败:", error);
      // Rollback on error
      setIsFavorited(rollbackValue);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-9 h-9 text-base",
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center rounded-lg transition-all duration-200 ${
        isFavorited
          ? "bg-amber-50 text-amber-500 hover:bg-amber-100"
          : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
      } ${sizeClasses[size]} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isFavorited ? "取消收藏" : "收藏"}
    >
      <StarIcon filled={isFavorited} />
    </button>
  );
}

export default FavoriteButton;
