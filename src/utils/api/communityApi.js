/**
 * Community API Service
 * 统一的社区提示词 API 调用接口
 * 使用 p-retry 实现自动重试逻辑
 */

import { supabase } from "../../lib/supabase";
import pRetry from 'p-retry';
import { RETRY_CONFIG } from '../../constants/validation';

/**
 * 基础重试包装器
 * 为 API 调用提供自动重试功能
 */
async function withRetry(fn, options = {}) {
  const defaultOptions = {
    retries: RETRY_CONFIG.MAX_ATTEMPTS,
    onFailedAttempt: (error) => {
      console.warn(
        `API 调用失败，第 ${error.attemptNumber} 次尝试。剩余重试次数: ${error.retriesLeft}`
      );
    }
  };

  return pRetry(fn, { ...defaultOptions, ...options });
}

/**
 * 检查用户认证状态
 * @throws {Error} 如果用户未登录
 */
async function ensureAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("请先登录");
  }
  return session;
}

/**
 * 复制社区提示词到用户库
 * @param {string} communityPromptId - 社区提示词 ID
 * @returns {Promise<Object>} 复制后的提示词数据
 */
export async function copyCommunityPrompt(communityPromptId) {
  return withRetry(async () => {
    const { data, error } = await supabase.rpc("copy_community_prompt", {
      p_community_prompt_id: communityPromptId,
    });

    if (error) throw error;

    return data;
  });
}

/**
 * 增加社区提示词浏览次数
 * @param {string} communityPromptId - 社区提示词 ID
 * @returns {Promise<void>}
 */
export async function incrementViewCount(communityPromptId) {
  return withRetry(async () => {
    const { error } = await supabase.rpc("increment_view_count", {
      p_community_prompt_id: communityPromptId,
    });

    if (error) throw error;
  }, { retries: 1 }); // 浏览计数失败不重试，避免影响用户体验
}

/**
 * 切换点赞状态
 * @param {string} communityPromptId - 社区提示词 ID
 * @returns {Promise<Object>} 更新后的点赞状态和计数
 */
export async function toggleLike(communityPromptId) {
  await ensureAuthenticated();

  return withRetry(async () => {
    const { data, error } = await supabase.rpc("toggle_like", {
      p_community_prompt_id: communityPromptId,
    });

    if (error) throw error;

    return data;
  });
}

/**
 * 切换收藏状态
 * @param {string} communityPromptId - 社区提示词 ID
 * @returns {Promise<Object>} 更新后的收藏状态和计数
 */
export async function toggleFavorite(communityPromptId) {
  await ensureAuthenticated();

  return withRetry(async () => {
    const { data, error } = await supabase.rpc("toggle_favorite", {
      p_community_prompt_id: communityPromptId,
    });

    if (error) throw error;

    return data;
  });
}

/**
 * 撤回已发布的社区提示词
 * @param {string} communityPromptId - 社区提示词 ID
 * @returns {Promise<Object>} 撤回操作结果
 */
export async function withdrawCommunityPrompt(communityPromptId) {
  await ensureAuthenticated();

  return withRetry(async () => {
    const { data, error } = await supabase.rpc("withdraw_community_prompt", {
      p_community_prompt_id: communityPromptId,
    });

    if (error) throw error;

    return data;
  });
}

/**
 * 获取用户交互数据（点赞和收藏）
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} 包含 likedIds 和 favoritedIds 的 Set
 */
export async function fetchUserInteractions(userId) {
  try {
    // 尝试使用优化后的组合函数
    return await withRetry(async () => {
      const { data, error } = await supabase.rpc("get_user_interactions_optimized", {
        p_user_id: userId,
      });

      if (!error && data) {
        return {
          likedIds: new Set(data.likedIds || []),
          favoritedIds: new Set(data.favoritedIds || []),
        };
      }

      throw new Error("Optimized function not available");
    }, { retries: 0 }); // 不重试，直接使用 fallback
  } catch (err) {
    // 回退到单独的查询
    console.warn("使用优化的函数失败，回退到单独查询:", err);

    const [likesResult, favoritesResult] = await Promise.all([
      supabase
        .from("community_likes")
        .select("community_prompt_id")
        .eq("user_id", userId),
      supabase
        .from("community_favorites")
        .select("community_prompt_id")
        .eq("user_id", userId),
    ]);

    const likedIds = new Set(
      likesResult.error ? [] : (likesResult.data || []).map((l) => l.community_prompt_id)
    );

    const favoritedIds = new Set(
      favoritesResult.error ? [] : (favoritesResult.data || []).map((f) => f.community_prompt_id)
    );

    return { likedIds, favoritedIds };
  }
}

/**
 * 获取或创建用户档案
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} 用户档案数据
 */
export async function getOrCreateUserProfile(userId) {
  return withRetry(async () => {
    const { data, error } = await supabase.rpc('get_or_create_user_profile', {
      p_user_id: userId,
    });

    if (error) throw error;

    return data && data.length > 0 ? data[0] : null;
  });
}

/**
 * 更新用户档案
 * @param {Object} profile - 用户档案数据
 * @param {string} profile.displayName - 显示名称
 * @param {string} profile.bio - 个人简介
 * @param {string} profile.avatarUrl - 头像 URL
 * @returns {Promise<Object>} 更新后的用户档案数据
 */
export async function updateUserProfile({ displayName, bio, avatarUrl }) {
  await ensureAuthenticated();

  return withRetry(async () => {
    const { data, error } = await supabase.rpc('update_user_profile', {
      p_display_name: displayName || null,
      p_bio: bio || null,
      p_avatar_url: avatarUrl || null,
    });

    if (error) throw error;

    return data && data.length > 0 ? data[0] : null;
  });
}

/**
 * 获取用户档案统计数据
 * @param {string} userId - 用户 ID
 * @returns {Promise<Object>} 用户档案统计数据
 */
export async function getUserProfileStats(userId) {
  return withRetry(async () => {
    const { data, error } = await supabase.rpc('get_user_profile_stats', {
      p_user_id: userId,
    });

    if (error) throw error;

    return data && data.length > 0 ? data[0] : null;
  });
}

/**
 * 获取用户已发布的提示词
 * @param {string} userId - 用户 ID
 * @param {number} limit - 限制数量
 * @param {number} offset - 偏移量
 * @returns {Promise<Array>} 用户已发布的提示词列表
 */
export async function getUserPrompts(userId, limit = 50, offset = 0) {
  return withRetry(async () => {
    const { data, error } = await supabase.rpc('get_user_prompts', {
      p_user_id: userId,
      p_limit: limit,
      p_offset: offset,
    });

    if (error) throw error;

    return data || [];
  });
}
