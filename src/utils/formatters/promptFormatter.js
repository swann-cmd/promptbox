/**
 * Prompt Data Formatter
 * 提示词数据格式化工具
 * 将数据库原始数据转换为应用使用的格式
 */

import { PROMPT_STATUS } from '../../constants/community';

/**
 * 格式化标签验证函数（防止 XSS）
 * 使用白名单方法，拒绝所有包含 HTML 实体的标签
 *
 * SECURITY WARNING: This is client-side validation only.
 * Malicious users can bypass this by making direct API calls or modifying client code.
 * TODO: Add database-level validation (check constraint or trigger) for defense in depth.
 *
 * @param {string} tag - 待验证的标签
 * @returns {boolean} 是否为有效标签
 */
export function validateTag(tag) {
  if (typeof tag !== 'string') return false;
  if (tag.length === 0 || tag.length > 50) return false;

  // 检查是否包含任何 HTML 实体编码模式（包括变体）
  // 匹配：&#123; &#x1F; &lt; &gt; &amp; 等
  const hasEntities = /&(?:#\d+|#x[\da-fA-F]+|[a-zA-Z]+);/.test(tag);

  if (hasEntities) {
    return false; // 拒绝任何包含 HTML 实体的标签
  }

  // 检查是否包含危险字符
  if (/[<>"]/.test(tag)) {
    return false;
  }

  // 只允许字母数字、中文、下划线和连字符（白名单方法）
  return /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(tag);
}

/**
 * 格式化和验证标签数组
 * @param {Array<string>} tags - 原始标签数组
 * @returns {Array<string>} 验证后的标签数组
 */
export function formatTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.filter(validateTag);
}

/**
 * 格式化提示词数据（从 Supabase 格式到应用格式）
 * @param {Array} data - Supabase 原始提示词数据
 * @param {Map} communityPromptMap - prompt_id -> community_prompt_id 的映射
 * @returns {Array} 格式化后的提示词数组
 */
export function formatPromptData(data, communityPromptMap = new Map()) {
  return (data || []).map((p) => {
    const communityPromptId = communityPromptMap.get(p.id);
    return {
      id: p.id,
      title: p.title,
      content: p.content,
      categoryId: p.category_id,
      categoryName: p.categories?.name,
      categorySlug: p.categories?.slug,
      model: p.model,
      tags: formatTags(p.tags),
      usageCount: p.usage_count,
      createdAt: p.created_at,
      isPublishedToCommunity: Boolean(communityPromptId),
      communityPromptId: communityPromptId || null,
    };
  });
}

/**
 * 格式化社区提示词数据
 * @param {Array} data - Supabase 原始社区提示词数据
 * @returns {Array} 格式化后的社区提示词数组
 */
export function formatCommunityPromptData(data) {
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
 * 应用用户交互数据到社区提示词
 * @param {Array} prompts - 社区提示词数组
 * @param {Set} likedIds - 已点赞的提示词 ID 集合
 * @param {Set} favoritedIds - 已收藏的提示词 ID 集合
 * @returns {Array} 更新后的社区提示词数组
 */
export function applyUserInteractions(prompts, likedIds = new Set(), favoritedIds = new Set()) {
  return prompts.map((p) => ({
    ...p,
    is_liked: likedIds.has(p.id),
    is_favorited: favoritedIds.has(p.id),
  }));
}

/**
 * 创建提示词 ID 到社区提示词 ID 的映射
 * @param {Array} communityPrompts - 社区提示词数组
 * @returns {Map} prompt_id -> community_prompt_id 的映射
 */
export function createCommunityPromptMap(communityPrompts) {
  const map = new Map();
  if (!communityPrompts) return map;

  communityPrompts.forEach((cp) => {
    if (cp.status === PROMPT_STATUS.PUBLISHED) {
      map.set(cp.prompt_id, cp.id);
    }
  });

  return map;
}
