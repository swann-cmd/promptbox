import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import CategoryBadge from "../ui/CategoryBadge";
import CopyButton from "../ui/CopyButton";
import LikeButton from "./LikeButton";
import FavoriteButton from "./FavoriteButton";
import UserAvatar from "../user/UserAvatar";
import ModalWrapper from "../ui/ModalWrapper";
import { ViewIcon, CopySmallIcon, DateIcon, ChevronRightIcon } from "../ui/icons";
import { copyCommunityPrompt, incrementViewCount, withdrawCommunityPrompt } from "../../utils/community";
import Dialog from "../ui/dialogs/Dialog";

/**
 * 社区提示词详情模态框
 */
function CommunityDetailModal({ prompt, user, userLikes, userFavorites, onClose, onError, onCopy, onWithdraw, onShowUserProfile }) {
  const [viewCount, setViewCount] = useState(prompt.view_count || 0);
  const [copying, setCopying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const hasViewedRef = useRef(false);

  // 检查是否为该提示词的作者
  const isAuthor = user && user.id === prompt.user_id;

  useEffect(() => {
    // Prevent double counting with ref
    if (hasViewedRef.current) return;
    hasViewedRef.current = true;

    const incrementView = async () => {
      try {
        await incrementViewCount(prompt.id);
        setViewCount((prev) => prev + 1);
      } catch (error) {
        console.warn("更新浏览次数失败:", error);
      }
    };
    incrementView();
  }, [prompt.id]);

  // 同步 prompt.view_count 的变化
  useEffect(() => {
    setViewCount(prompt.view_count || 0);
  }, [prompt.view_count]);

  const handleCopy = async () => {
    setCopying(true);
    try {
      if (user) {
        // 已登录：复制到个人库
        const data = await copyCommunityPrompt(prompt.id);
        if (onError) onError("复制成功", "提示词已添加到您的个人库");
        if (onCopy) onCopy(data);
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

  const handleWithdraw = async () => {
    setConfirmDialog({
      isOpen: true,
      title: "撤回提示词",
      message: "确定要撤回这条提示词吗？撤回后将不再显示在社区广场。",
      onConfirm: async () => {
        setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
        setWithdrawing(true);
        try {
          await withdrawCommunityPrompt(prompt.id);
          if (onError) onError("撤回成功", "提示词已从社区撤回");
          // 关闭详情页
          onClose();
          // 刷新社区列表
          if (onWithdraw) onWithdraw();
        } catch (error) {
          console.error("撤回失败:", error);
          if (onError) onError("撤回失败", error.message);
        } finally {
          setWithdrawing(false);
        }
      }
    });
  };

  return (
    <>
      <ModalWrapper
        isOpen={true}
        onClose={onClose}
        size="lg"
      >
        {/* Custom header content */}
        <div className="px-6 pt-6 pb-4 -mt-2 -mx-6">
          <div className="flex items-start justify-between gap-4 mb-2.5">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 leading-snug mb-2.5">
                {prompt.title}
              </h2>
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

          {/* Author Info */}
          <button
            onClick={() => {
              if (onShowUserProfile) onShowUserProfile(prompt.user_id);
            }}
            className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 w-full hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors text-left"
          >
            <UserAvatar
              src={prompt.user_avatar_url}
              alt={prompt.user_display_name}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate">
                {prompt.user_display_name || "匿名用户"}
              </p>
              <p className="text-xs text-gray-400">
                发布于 {new Date(prompt.published_at).toLocaleString("zh-CN")}
              </p>
            </div>
            <ChevronRightIcon />
          </button>
        </div>

        {/* Description */}
        {prompt.description && (
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 -mx-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              {prompt.description}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto -mx-6" style={{ maxHeight: "calc(85vh - 320px)" }}>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {prompt.content}
            </p>
          </div>

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {prompt.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 border-t border-gray-50 -mx-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <ViewIcon />
                <span>浏览 {viewCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <CopySmallIcon />
                <span>复制 {prompt.copy_count || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <DateIcon />
                <span>{new Date(prompt.published_at).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LikeButton
                communityPromptId={prompt.id}
                initialLiked={userLikes.has(prompt.id)}
                initialLikeCount={prompt.like_count || 0}
                size="md"
              />
              <FavoriteButton
                communityPromptId={prompt.id}
                initialFavorited={userFavorites.has(prompt.id)}
                size="md"
              />
              {isAuthor && (
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{withdrawing ? "撤回中..." : "撤回发布"}</span>
                </button>
              )}
              <button
                onClick={handleCopy}
                disabled={copying}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
              >
                <CopySmallIcon />
                <span>{copying ? "复制中..." : (user ? "复制到我的库" : "复制内容")}</span>
              </button>
            </div>
          </div>
        </div>
      </ModalWrapper>

      {/* Confirm Dialog */}
      <Dialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="confirm"
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null })}
      />
    </>
  );
}

CommunityDetailModal.propTypes = {
  prompt: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    description: PropTypes.string,
    category_slug: PropTypes.string.isRequired,
    category_name: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    view_count: PropTypes.number,
    copy_count: PropTypes.number,
    like_count: PropTypes.number,
    user_id: PropTypes.string.isRequired,
    user_display_name: PropTypes.string,
    user_avatar_url: PropTypes.string,
    published_at: PropTypes.string.isRequired,
  }).isRequired,
  user: PropTypes.shape({
    id: PropTypes.string,
  }),
  userLikes: PropTypes.instanceOf(Set).isRequired,
  userFavorites: PropTypes.instanceOf(Set).isRequired,
  onClose: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onCopy: PropTypes.func,
  onWithdraw: PropTypes.func,
  onShowUserProfile: PropTypes.func,
};

CommunityDetailModal.defaultProps = {
  user: null,
  onCopy: null,
  onWithdraw: null,
  onShowUserProfile: null,
};

export default CommunityDetailModal;
