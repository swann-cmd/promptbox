/**
 * Tests for promptFormatter utilities
 */

import { describe, it, expect } from 'vitest';
import { formatTags, formatPromptData, formatCommunityPromptData, applyUserInteractions, createCommunityPromptMap } from '../promptFormatter';

describe('formatTags', () => {
  it('should filter out invalid tags', () => {
    const input = ['valid', 'invalid<script>', 'also-valid', '<iframe>'];
    const expected = ['valid', 'also-valid'];
    expect(formatTags(input)).toEqual(expected);
  });

  it('should handle empty array', () => {
    expect(formatTags([])).toEqual([]);
  });

  it('should handle non-array input', () => {
    expect(formatTags(null)).toEqual([]);
    expect(formatTags(undefined)).toEqual([]);
    expect(formatTags('string')).toEqual([]);
  });

  it('should allow Chinese characters', () => {
    const input = ['测试', '测试标签', 'test测试'];
    expect(formatTags(input)).toEqual(input);
  });

  it('should allow alphanumeric with hyphens and underscores', () => {
    const input = ['test-tag', 'test_tag', 'test123'];
    expect(formatTags(input)).toEqual(input);
  });

  it('should reject tags with HTML entity encoding', () => {
    const input = ['&lt;script&gt;', 'test&lt;'];
    expect(formatTags(input)).toEqual([]);
  });

  it('should reject tags longer than 50 characters', () => {
    const longTag = 'a'.repeat(51);
    const input = ['valid', longTag];
    expect(formatTags(input)).toEqual(['valid']);
  });
});

describe('formatPromptData', () => {
  it('should format raw prompt data correctly', () => {
    const input = [
      {
        id: 1,
        title: 'Test Prompt',
        content: 'Test content',
        category_id: 1,
        categories: { name: 'Test Category', slug: 'test' },
        model: 'ChatGPT',
        tags: ['tag1', 'tag2'],
        usage_count: 5,
        created_at: '2024-01-01T00:00:00Z',
      }
    ];

    const communityMap = new Map([[1, 100]]);

    const result = formatPromptData(input, communityMap);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 1,
      title: 'Test Prompt',
      content: 'Test content',
      categoryId: 1,
      categoryName: 'Test Category',
      categorySlug: 'test',
      model: 'ChatGPT',
      tags: ['tag1', 'tag2'],
      usageCount: 5,
      createdAt: '2024-01-01T00:00:00Z',
      isPublishedToCommunity: true,
      communityPromptId: 100,
    });
  });

  it('should handle null input', () => {
    expect(formatPromptData(null)).toEqual([]);
  });

  it('should handle missing category', () => {
    const input = [
      {
        id: 1,
        title: 'Test',
        content: 'Content',
        category_id: null,
        model: 'ChatGPT',
        tags: null,
        usage_count: 0,
        created_at: '2024-01-01',
      }
    ];

    const result = formatPromptData(input);

    expect(result[0].categoryName).toBeUndefined();
    expect(result[0].categorySlug).toBeUndefined();
    expect(result[0].tags).toEqual([]);
  });
});

describe('formatCommunityPromptData', () => {
  it('should format community prompt data correctly', () => {
    const input = [
      {
        id: 1,
        title: 'Community Prompt',
        content: 'Content',
        category_name: 'Category',
        category_slug: 'category',
        model: 'Claude',
        description: 'Description',
        tags: ['tag1'],
        view_count: 10,
        copy_count: 5,
        like_count: 3,
        user_id: 'user123',
        published_at: '2024-01-01',
        created_at: '2024-01-01',
      }
    ];

    const result = formatCommunityPromptData(input);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 1,
      title: 'Community Prompt',
      view_count: 10,
      copy_count: 5,
      like_count: 3,
      is_liked: false,
      is_favorited: false,
    });
  });

  it('should use user_profiles data when available', () => {
    const input = [
      {
        id: 1,
        title: 'Test',
        content: 'Content',
        category_name: 'Category',
        category_slug: 'category',
        model: 'ChatGPT',
        tags: [],
        user_id: 'user123',
        user_profiles: {
          display_name: 'Test User',
          avatar_url: 'avatar.jpg',
        },
        published_at: '2024-01-01',
        created_at: '2024-01-01',
      }
    ];

    const result = formatCommunityPromptData(input);

    expect(result[0].user_display_name).toBe('Test User');
    expect(result[0].user_avatar_url).toBe('avatar.jpg');
  });
});

describe('applyUserInteractions', () => {
  it('should apply liked and favorited status', () => {
    const prompts = [
      { id: 1, title: 'Prompt 1' },
      { id: 2, title: 'Prompt 2' },
      { id: 3, title: 'Prompt 3' },
    ];

    const likedIds = new Set([1, 2]);
    const favoritedIds = new Set([2, 3]);

    const result = applyUserInteractions(prompts, likedIds, favoritedIds);

    expect(result[0].is_liked).toBe(true);
    expect(result[0].is_favorited).toBe(false);
    expect(result[1].is_liked).toBe(true);
    expect(result[1].is_favorited).toBe(true);
    expect(result[2].is_liked).toBe(false);
    expect(result[2].is_favorited).toBe(true);
  });
});

describe('createCommunityPromptMap', () => {
  it('should create map of prompt_id to community_prompt_id', () => {
    const communityPrompts = [
      { id: 100, prompt_id: 1, status: 'published' },
      { id: 101, prompt_id: 2, status: 'published' },
      { id: 102, prompt_id: 3, status: 'draft' },
    ];

    const map = createCommunityPromptMap(communityPrompts);

    expect(map.get(1)).toBe(100);
    expect(map.get(2)).toBe(101);
    expect(map.get(3)).toBeUndefined();
  });

  it('should handle null input', () => {
    const map = createCommunityPromptMap(null);
    expect(map.size).toBe(0);
  });
});
