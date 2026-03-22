import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import CommunityPromptCard from "./CommunityPromptCard";
import CommunityTabs from "./CommunityTabs";
import CommunityDetailModal from "./CommunityDetailModal";
import { SearchIcon, LoadingSpinner, EmptyStateIcon } from "../ui/icons";
import { SearchInput, LoadingState, EmptyState } from "../ui";
import { formatCommunityPromptData, fetchUserInteractions } from "../../utils/community";
import { COMMUNITY_MAX_PROMPTS, COMMUNITY_TAB } from "../../constants/community";

/**
 * 社区广场主页面
 */
function CommunityPage({ user, onClose, onError, onShowUserProfile }) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("latest");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [userLikes, setUserLikes] = useState(new Set());
  const [userFavorites, setUserFavorites] = useState(new Set());

  // ============== 函数定义 ==============
  // 必须在 useEffect 之前定义所有函数

  const loadUserInteractions = useCallback(async () => {
    if (!user) return;

    try {
      const { likedIds, favoritedIds } = await fetchUserInteractions(user.id);
      setUserLikes(likedIds);
      setUserFavorites(favoritedIds);
    } catch (error) {
      console.error("加载用户互动状态失败:", error);
    }
  }, [user]);

  const fetchCommunityPrompts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("community_prompts")
        .select("*")
        .eq("status", "published");

      if (activeTab === "latest") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("like_count", { ascending: false })
          .order("copy_count", { ascending: false });
      }

      query = query.limit(COMMUNITY_MAX_PROMPTS);

      const { data, error } = await query;

      if (error) throw error;

      // 获取所有唯一的 user_id
      const userIds = [...new Set(data.map(p => p.user_id))];

      // 批量获取用户档案
      let profilesMap = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);

        if (profiles) {
          profilesMap = profiles.reduce((acc, profile) => {
            acc[profile.user_id] = {
              user_id: profile.user_id,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url
            };
            return acc;
          }, {});
        }
      }

      // 合并用户档案数据
      const dataWithProfiles = data.map(p => ({
        ...p,
        user_profiles: profilesMap[p.user_id] || null
      }));

      setPrompts(formatCommunityPromptData(dataWithProfiles));
    } catch (error) {
      console.error("加载社区提示词失败:", error);
      if (onError) onError("加载失败", error.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, onError]);

  const handleLikeChange = useCallback(({ communityPromptId, likeCount }) => {
    setPrompts(prev => prev.map(p =>
      p.id === communityPromptId ? { ...p, like_count: likeCount } : p
    ));
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

  // ============== useEffect Hooks ==============
  // 必须在所有函数定义之后

  // 加载社区提示词
  useEffect(() => {
    fetchCommunityPrompts();
  }, [activeTab, fetchCommunityPrompts]);

  // 加载用户互动状态
  useEffect(() => {
    if (user) {
      loadUserInteractions();
    }
  }, [user, loadUserInteractions]);

  // 过滤逻辑 - 使用 useMemo 优化性能，避免重复的 toLowerCase 调用
  const filteredPrompts = useMemo(() => {
    let filtered = prompts;

    // 分类过滤（快速）
    if (activeCategory !== "all") {
      filtered = filtered.filter((p) => p.category_slug === activeCategory);
    }

    // 搜索过滤（只在有搜索词时执行）
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        // 快速检查：title 和 description 较短，优先检查
        const titleMatch = p.title.toLowerCase().includes(query);
        if (titleMatch) return true;

        const descMatch = p.description?.toLowerCase().includes(query);
        if (descMatch) return true;

        // tags 检查（如果有）
        if (p.tags && p.tags.length > 0) {
          return p.tags.some((tag) => tag.toLowerCase().includes(query));
        }

        // 最后检查 content（可能较长）
        return p.content.toLowerCase().includes(query);
      });
    }

    return filtered;
  }, [prompts, activeCategory, searchQuery]);

  // 提取唯一分类 - 优化为 useMemo 避免不必要的重新计算
  const categories = useMemo(() => {
    const categoryMap = new Map();
    prompts.forEach((p) => {
      if (p.category_slug && !categoryMap.has(p.category_slug)) {
        categoryMap.set(p.category_slug, {
          slug: p.category_slug,
          name: p.category_name,
        });
      }
    });
    return Array.from(categoryMap.values());
  }, [prompts]);

  // 分类列表 - 使用 useMemo 避免每次渲染创建新数组
  const allCategories = useMemo(() => [
    { slug: "all", name: "全部分类" },
    ...categories,
  ], [categories]);

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm shadow-purple-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">社区广场</span>
            </div>
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
        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索提示词标题、内容或标签..."
          color="purple"
          className="mb-5"
        />

        {/* Category Filter */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {allCategories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat.slug
                  ? "bg-purple-500 text-white shadow-sm shadow-purple-200"
                  : "bg-white text-gray-500 hover:text-gray-700 border border-gray-100 hover:border-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <CommunityTabs activeTab={activeTab} onChange={setActiveTab} />

        {/* Content */}
        {loading ? (
          <LoadingState
            icon={<LoadingSpinner />}
            message="加载中..."
          />
        ) : filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrompts.map((p) => (
              <CommunityPromptCard
                key={p.id}
                prompt={{
                  ...p,
                  is_liked: userLikes.has(p.id),
                  is_favorited: userFavorites.has(p.id),
                }}
                user={user}
                onClick={setSelectedPrompt}
                onError={onError}
                onLikeChange={handleLikeChange}
                onFavoriteChange={handleFavoriteChange}
                onShowUserProfile={onShowUserProfile}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<EmptyStateIcon />}
            title="没有找到相关提示词"
            message="试试调整搜索词或选择其他分类"
            action={
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="text-sm text-purple-500 hover:text-purple-600 font-medium"
              >
                清除筛选
              </button>
            }
          />
        )}

        {/* Stats */}
        <div className="flex items-center justify-center mt-6">
          <p className="text-xs text-gray-400">
            共 <span className="font-semibold text-gray-600">{filteredPrompts.length}</span> 条社区提示词
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPrompt && (
        <CommunityDetailModal
          key={selectedPrompt.id}
          prompt={selectedPrompt}
          user={user}
          userLikes={userLikes}
          userFavorites={userFavorites}
          onClose={() => setSelectedPrompt(null)}
          onError={onError}
          onCopy={() => {
            // 刷新列表
            fetchCommunityPrompts();
          }}
          onWithdraw={() => {
            // 刷新列表
            fetchCommunityPrompts();
          }}
          onShowUserProfile={onShowUserProfile}
        />
      )}
    </div>
  );
}

export default CommunityPage;
