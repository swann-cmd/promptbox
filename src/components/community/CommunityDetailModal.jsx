import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import CategoryBadge from "../ui/CategoryBadge";
import CopyButton from "../ui/CopyButton";
import LikeButton from "./LikeButton";
import FavoriteButton from "./FavoriteButton";
import UserAvatar from "../user/UserAvatar";
import ModalWrapper from "../ui/ModalWrapper";
import { CloseIcon, ViewIcon, CopySmallIcon, DateIcon, ChevronRightIcon } from "../ui/icons";
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
  const currentPromptIdRef = useRef(null);

  // 检查是否为该提示词的作者
  const isAuthor = user && user.id === prompt.user_id;

  // 当 prompt.id 变化时，重置状态并更新初始值
  useEffect(() => {
    if (currentPromptIdRef.current !== prompt.id) {
      currentPromptIdRef.current = prompt.id;
      setViewCount(prompt.view_count || 0);
      hasViewedRef.current = false; // 重置浏览标志
    }
  }, [prompt.id, prompt.view_count]);

  // 增加浏览次数（仅在新 prompt 首次加载时）
  useEffect(() => {
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
  }, [prompt.id]); // 只依赖 prompt.id

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
        showHeader={false}
      >
        {/* Custom header content */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-50 dark:border-dark-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text leading-snug mb-2.5">
                {prompt.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge
                  categorySlug={prompt.category_slug}
                  categoryName={prompt.category_name}
                />
                <span className="text-xs text-gray-400 dark:text-dark-textSecondary bg-gray-50 dark:bg-dark-bg px-2.5 py-1 rounded-full font-medium">
                  {prompt.model}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Author Info */}
          <button
            onClick={() => {
              if (onShowUserProfile) onShowUserProfile(prompt.user_id);
            }}
            className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-dark-border w-full hover:bg-gray-50 dark:hover:bg-dark-bg -mx-2 px-2 py-1 rounded-lg transition-colors text-left"
          >
            <UserAvatar
              src={prompt.user_avatar_url}
              alt={prompt.user_display_name}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 dark:text-dark-text truncate">
                {prompt.user_display_name || "匿名用户"}
              </p>
              <p className="text-xs text-gray-400 dark:text-dark-textSecondary">
                发布于 {new Date(prompt.published_at).toLocaleString("zh-CN")}
              </p>
            </div>
            <ChevronRightIcon />
          </button>
        </div>

        {/* Description */}
        {prompt.description && (
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
            <p className="text-sm text-gray-700 dark:text-dark-text leading-relaxed">
              {prompt.description}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="px-4 sm:px-6 py-5 overflow-y-auto" style={{ maxHeight: "calc(85vh - 320px)" }}>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm text-gray-700 dark:text-dark-text leading-relaxed whitespace-pre-wrap">
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
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t border-gray-50 dark:border-dark-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-textSecondary">
                <ViewIcon />
                <span className="hidden sm:inline">浏览</span> {viewCount}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-dark-textSecondary">
                <CopySmallIcon />
                <span className="hidden sm:inline">复制</span> {prompt.copy_count || 0}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-dark-textSecondary">
                <DateIcon />
                <span>{new Date(prompt.published_at).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
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
                  className="flex items-center justify-center px-2 py-1.5 sm:px-3 sm:py-1.5 bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-dark-text text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="撤回发布"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span className="hidden sm:inline">{withdrawing ? "撤回中..." : "撤回"}</span>
                </button>
              )}
              <button
                onClick={handleCopy}
                disabled={copying}
                className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
                title={user ? "复制到我的库" : "复制内容"}
              >
                <CopySmallIcon />
                <span className="hidden sm:inline">{copying ? "复制中..." : (user ? "复制" : "复制")}</span>
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
