/**
 * Community Utilities - Backward Compatibility Layer
 * 这个文件重新导出新模块的功能，以保持向后兼容性
 * @deprecated 建议直接从各个子模块导入:
 *   - API 函数: './api/communityApi'
 *   - 格式化函数: './formatters/promptFormatter'
 */

// Re-export API functions
export {
  copyCommunityPrompt,
  incrementViewCount,
  toggleLike,
  toggleFavorite,
  withdrawCommunityPrompt,
  fetchUserInteractions,
  getOrCreateUserProfile,
  updateUserProfile,
  getUserProfileStats,
  getUserPrompts,
} from './api/communityApi';

// Re-export formatter functions
export {
  formatPromptData,
  formatCommunityPromptData,
  formatTags,
  applyUserInteractions,
  createCommunityPromptMap,
} from './formatters/promptFormatter';

// Re-export validators (for backward compatibility)
export { validateTag } from './formatters/promptFormatter';

/**
 * Check if user is authenticated, redirect to login if not
 * @deprecated 这个函数将在未来版本中移除
 * @param {Object} user - 用户对象
 * @returns {boolean} 是否已认证
 */
export function requireAuth(user) {
  if (!user) {
    window.location.href = "/login";
    return false;
  }
  return true;
}
