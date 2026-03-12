import { useState, memo } from "react";
import CategoryBadge from "../ui/CategoryBadge";
import LikeButton from "./LikeButton";
import FavoriteButton from "./FavoriteButton";
import UserAvatar from "../user/UserAvatar";
import { ViewIcon, CopySmallIcon, DateIcon } from "../ui/icons";
import { copyCommunityPrompt, incrementViewCount } from "../../utils/community";

/**
 * 社区提示词卡片组件
 */
function CommunityPromptCard({
  prompt,
  user,
  onCopy,
  onClick,
  onError,
  onLikeChange,
  onFavoriteChange,
  onShowUserProfile,
}) {
  const [copying, setCopying] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation(); // 阻止事件冒泡，防止打开详情页

    setCopying(true);
    try {
      if (user) {
        // 已登录：复制到个人库
        const data = await copyCommunityPrompt(prompt.id);
        if (onCopy) onCopy(data);
        if (onError) onError("复制成功", "提示词已添加到您的个人库");
      } else {
        // 未登录：直接复制内容到剪贴板
        await navigator.clipboard.writeText(prompt.content);
        if (onError) onError("复制成功", "提示词内容已复制到剪贴板");
      }
    } catch (error) {
      console.error("复制失败:", error);
      if (onError) onError("复制失败", error.message);
    } finally {
      setCopying(false);
    }
  };

  const handleView = async () => {
    try {
      await incrementViewCount(prompt.id);
    } catch (error) {
      console.error("更新浏览次数失败:", error);
    }
    if (onClick) onClick(prompt);
  };

  return (
    <div
      className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
      onClick={handleView}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {prompt.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge
              categorySlug={prompt.category_slug}
              categoryName={prompt.category_name}
            />
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full font-medium">
              {prompt.model}
            </span>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
          {prompt.description || prompt.content}
        </p>
      </div>

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prompt.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md"
            >
              #{tag}
            </span>
          ))}
          {prompt.tags.length > 3 && (
            <span className="text-xs text-gray-400">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-3">
          {/* Author */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onShowUserProfile) onShowUserProfile(prompt.user_id);
            }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <UserAvatar
              src={prompt.user_avatar_url}
              alt={prompt.user_display_name}
              size="sm"
            />
            <span className="max-w-[80px] truncate">
              {prompt.user_display_name || "匿名用户"}
            </span>
          </button>

          {/* Stats */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <ViewIcon />
            <span>{prompt.view_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CopySmallIcon />
            <span>{prompt.copy_count || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <DateIcon />
            <span>{new Date(prompt.published_at).toLocaleDateString("zh-CN")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <LikeButton
            communityPromptId={prompt.id}
            initialLiked={prompt.is_liked || false}
            initialLikeCount={prompt.like_count || 0}
            onLikeChange={onLikeChange}
            size="sm"
          />
          <FavoriteButton
            communityPromptId={prompt.id}
            initialFavorited={prompt.is_favorited || false}
            onFavoriteChange={onFavoriteChange}
            size="sm"
          />
          <button
            onClick={handleCopy}
            disabled={copying}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title={user ? "复制到我的库" : "复制提示词内容"}
          >
            <CopySmallIcon />
            <span>{copying ? "复制中..." : "复制"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(CommunityPromptCard);
