import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import UserAvatar from "./UserAvatar";
import CommunityPromptCard from "../community/CommunityPromptCard";
import CommunityDetailModal from "../community/CommunityDetailModal";
import { CloseIcon, EmptyStateIcon, DocumentIcon, HeartIcon, CopySmallIcon, ViewIcon } from "../ui/icons";
import { getOrCreateUserProfile, getUserProfileStats, fetchUserInteractions } from "../../utils/community";
import { APP_FONT } from "../../constants/app";

/**
 * User Profile Page Component
 */
function UserProfilePage({ userId, currentUser, onClose, onError }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [userLikes, setUserLikes] = useState(new Set());
  const [userFavorites, setUserFavorites] = useState(new Set());

  const loadUserData = useCallback(async () => {
    try {
      // Load profile
      const profileData = await getOrCreateUserProfile(userId);
      setProfile(profileData);

      // Load stats
      const statsData = await getUserProfileStats(userId);
      setStats(statsData);

      // Load prompts with profile info using RPC
      const { data: promptsData, error: promptsError } = await supabase.rpc('get_user_prompts_with_profile', {
        p_user_id: userId,
        p_limit: 50,
        p_offset: 0
      });

      if (promptsError) throw promptsError;

      setPrompts((promptsData || []).map(p => ({
        ...p,
        is_liked: false,
        is_favorited: false,
      })));
    } catch (error) {
      console.error("加载用户数据失败:", error);
      if (onError) onError("加载失败", error.message);
    }
  }, [userId, onError]);

  const loadUserInteractions = useCallback(async () => {
    if (!currentUser) return;

    try {
      const { likedIds, favoritedIds } = await fetchUserInteractions(currentUser.id);
      setUserLikes(likedIds);
      setUserFavorites(favoritedIds);

      // Update prompts with interaction status
      setPrompts(prev => prev.map(p => ({
        ...p,
        is_liked: likedIds.has(p.id),
        is_favorited: favoritedIds.has(p.id),
      })));
    } catch (error) {
      console.error("加载用户互动状态失败:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    let aborted = false;

    const load = async () => {
      if (!aborted) {
        setLoading(true);
        await loadUserData();
        if (currentUser && !aborted) {
          await loadUserInteractions();
        }
        if (!aborted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      aborted = true;
    };
  }, [userId, currentUser, loadUserData, loadUserInteractions]);

  const handleLikeChange = useCallback(({ communityPromptId, isLiked, likeCount }) => {
    setPrompts(prev => prev.map(p => {
      if (p.id === communityPromptId) {
        return { ...p, like_count: likeCount };
      }
      return p;
    }));
  }, []);

  const handleFavoriteChange = useCallback(({ communityPromptId, isFavorited }) => {
    setUserFavorites(prev => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.add(communityPromptId);
      } else {
        newSet.delete(communityPromptId);
      }
      return newSet;
    });
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto" style={APP_FONT}>
        <div className="max-w-5xl mx-auto px-6 py-7">
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto" style={APP_FONT}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {isOwnProfile ? "我的主页" : (profile?.display_name || "用户主页")}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-7">
        {/* Profile Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-5">
          <div className="flex items-start gap-4">
            <UserAvatar
              src={profile?.avatar_url}
              alt={profile?.display_name}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {profile?.display_name || "匿名用户"}
              </h2>
              {profile?.bio && (
                <p className="text-sm text-gray-500 leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DocumentIcon />
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.prompt_count || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-400">发布</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <HeartIcon />
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.total_likes || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-400">获赞</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CopySmallIcon />
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.total_copies || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-400">复制</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ViewIcon />
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.total_views || 0}
                  </span>
                </div>
                <p className="text-xs text-gray-400">浏览</p>
              </div>
            </div>
          )}
        </div>

        {/* Prompts Section */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            发布的提示词 ({prompts.length})
          </h3>
        </div>

        {prompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((p) => (
              <CommunityPromptCard
                key={p.id}
                prompt={{
                  ...p,
                  user_display_name: p.user_display_name || profile?.display_name,
                  user_avatar_url: p.user_avatar_url || profile?.avatar_url,
                  is_liked: userLikes.has(p.id) || p.is_liked,
                  is_favorited: userFavorites.has(p.id) || p.is_favorited,
                }}
                user={currentUser}
                onClick={(prompt) => setSelectedPrompt(prompt)}
                onError={onError}
                onLikeChange={handleLikeChange}
                onFavoriteChange={handleFavoriteChange}
                onShowUserProfile={null}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <EmptyStateIcon />
            </div>
            <p className="text-sm text-gray-400">
              {isOwnProfile ? "你还没有发布任何提示词" : "该用户还没有发布任何提示词"}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPrompt && (
        <CommunityDetailModal
          key={selectedPrompt.id}
          prompt={{
            ...selectedPrompt,
            user_id: userId,
          }}
          user={currentUser}
          userLikes={userLikes}
          userFavorites={userFavorites}
          onClose={() => setSelectedPrompt(null)}
          onError={onError}
          onCopy={() => {
            // 刷新列表
            loadUserData();
          }}
          onWithdraw={() => {
            // 刷新列表
            loadUserData();
          }}
          onShowUserProfile={null}
        />
      )}
    </div>
  );
}

export default UserProfilePage;
