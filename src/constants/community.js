/**
 * Community feature constants
 */

// Query limits
export const COMMUNITY_PROMPTS_LIMIT = 50;
export const COMMUNITY_PROMPTS_INITIAL_LIMIT = 20;

// Tag limits
export const MAX_TAGS = 10;
export const MAX_TAG_LENGTH = 50;

// Text length limits
export const MAX_TITLE_LENGTH = 200;
export const MAX_CONTENT_LENGTH = 10000;
export const MAX_DESCRIPTION_LENGTH = 500;

// Rate limits (per minute)
export const MAX_LIKES_PER_MINUTE = 10;
export const MAX_FAVORITES_PER_MINUTE = 10;
export const MAX_COPIES_PER_MINUTE = 5;

// Pagination
export const PROMPTS_PER_PAGE = 20;

// Status
export const PROMPT_STATUS = {
  PUBLISHED: 'published',
  WITHDRAWN: 'withdrawn',
};

// Tab types
export const COMMUNITY_TAB = {
  LATEST: 'latest',
  POPULAR: 'popular',
};
