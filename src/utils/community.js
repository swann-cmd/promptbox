import { supabase } from "../lib/supabase";

/**
 * Check if user is authenticated, redirect to login if not
 */
function requireAuth(user) {
  if (!user) {
    window.location.href = "/login";
    return false;
  }
  return true;
}

/**
 * Copy a community prompt to user's library
 */
async function copyCommunityPrompt(communityPromptId) {
  const { data, error } = await supabase.rpc("copy_community_prompt", {
    p_community_prompt_id: communityPromptId,
  });

  if (error) throw error;

  return data;
}

/**
 * Increment view count for a community prompt
 */
async function incrementViewCount(communityPromptId) {
  const { error } = await supabase.rpc("increment_view_count", {
    p_community_prompt_id: communityPromptId,
  });

  if (error) throw error;
}

/**
 * Toggle like on a community prompt
 */
async function toggleLike(communityPromptId) {
  // Check authentication first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("请先登录");
  }

  const { data, error } = await supabase.rpc("toggle_like", {
    p_community_prompt_id: communityPromptId,
  });

  if (error) throw error;

  return data;
}

/**
 * Toggle favorite on a community prompt
 */
async function toggleFavorite(communityPromptId) {
  // Check authentication first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("请先登录");
  }

  const { data, error } = await supabase.rpc("toggle_favorite", {
    p_community_prompt_id: communityPromptId,
  });

  if (error) throw error;

  return data;
}

/**
 * Withdraw a published community prompt
 */
async function withdrawCommunityPrompt(communityPromptId) {
  // Check authentication first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("请先登录");
  }

  const { data, error } = await supabase.rpc("withdraw_community_prompt", {
    p_community_prompt_id: communityPromptId,
  });

  if (error) throw error;

  return data;
}

/**
 * Format prompt data from Supabase to app format
 */
function formatPromptData(data, publishedPromptIds = new Set()) {
  return (data || []).map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    categoryId: p.category_id,
    categoryName: p.categories?.name,
    categorySlug: p.categories?.slug,
    model: p.model,
    tags: p.tags || [],
    usageCount: p.usage_count,
    createdAt: p.created_at,
    isPublishedToCommunity: publishedPromptIds.has(p.id),
  }));
}

/**
 * Validate tag format (prevent XSS)
 * Enhanced to handle HTML entity encoding attempts
 */
function validateTag(tag) {
  if (typeof tag !== 'string') return false;
  if (tag.length === 0 || tag.length > 50) return false;

  // Remove any HTML entities first (basic decoding)
  const decoded = tag
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));

  // Check if original tag contains HTML entities (potential attack)
  if (tag !== decoded && /[<>]/.test(decoded)) {
    return false; // Reject tags that decode to HTML tags
  }

  // Only allow alphanumeric, Chinese characters, underscores, and hyphens
  return /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(tag);
}

/**
 * Format and validate tags array
 */
function formatTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.filter(validateTag);
}

/**
 * Format community prompt data
 */
function formatCommunityPromptData(data) {
  return (data || []).map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    category_name: p.category_name,
    category_slug: p.category_slug,
    model: p.model,
    description: p.description,
    tags: formatTags(p.tags),
    view_count: p.view_count || 0,
    copy_count: p.copy_count || 0,
    like_count: p.like_count || 0,
    is_liked: false,
    is_favorited: false,
    user_id: p.user_id,
    user_display_name: p.user_display_name || p.user_profiles?.display_name || null,
    user_avatar_url: p.user_avatar_url || p.user_profiles?.avatar_url || null,
    published_at: p.published_at,
    created_at: p.created_at,
  }));
}

/**
 * Fetch user interactions (likes and favorites)
 * Optimized version using combined database function
 */
async function fetchUserInteractions(userId) {
  try {
    // Try to use the optimized function first
    const { data, error } = await supabase.rpc("get_user_interactions_optimized", {
      p_user_id: userId,
    });

    if (!error && data) {
      return {
        likedIds: new Set(data.likedIds || []),
        favoritedIds: new Set(data.favoritedIds || []),
      };
    }
  } catch (err) {
    // Fall back to individual queries if optimized function doesn't exist
    console.warn("Optimized function not available, using fallback:", err);
  }

  // Fallback to individual queries
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

/**
 * Get or create user profile
 */
async function getOrCreateUserProfile(userId) {
  const { data, error } = await supabase.rpc('get_or_create_user_profile', {
    p_user_id: userId,
  });

  if (error) throw error;

  // Return the first row if data exists
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Update user profile
 */
async function updateUserProfile({ displayName, bio, avatarUrl }) {
  const { data, error } = await supabase.rpc('update_user_profile', {
    p_display_name: displayName || null,
    p_bio: bio || null,
    p_avatar_url: avatarUrl || null,
  });

  if (error) throw error;

  // Return the first row if data exists
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Get user profile statistics
 */
async function getUserProfileStats(userId) {
  const { data, error } = await supabase.rpc('get_user_profile_stats', {
    p_user_id: userId,
  });

  if (error) throw error;

  // Return the first row if data exists
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Get user's published prompts
 */
async function getUserPrompts(userId, limit = 50, offset = 0) {
  const { data, error } = await supabase.rpc('get_user_prompts', {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) throw error;

  return data || [];
}

export {
  requireAuth,
  copyCommunityPrompt,
  incrementViewCount,
  toggleLike,
  toggleFavorite,
  withdrawCommunityPrompt,
  formatPromptData,
  formatCommunityPromptData,
  fetchUserInteractions,
  validateTag,
  formatTags,
  getOrCreateUserProfile,
  updateUserProfile,
  getUserProfileStats,
  getUserPrompts,
};
