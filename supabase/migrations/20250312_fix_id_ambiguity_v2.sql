-- 彻底修复所有可能的 id 字段歧义问题
-- 重新创建所有相关函数，确保所有字段引用都明确指定表前缀

-- 1. 先删除旧的函数
DROP FUNCTION IF EXISTS get_user_prompts_with_profile(UUID, INT, INT);

-- 2. 重新创建函数，使用明确的字段别名
CREATE OR REPLACE FUNCTION get_user_prompts_with_profile(
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  prompt_id UUID,  -- 明确命名为 prompt_id
  title TEXT,
  content TEXT,
  category_name TEXT,
  category_slug TEXT,
  model TEXT,
  description TEXT,
  tags TEXT[],
  view_count INTEGER,
  copy_count INTEGER,
  like_count INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  user_display_name TEXT,
  user_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id AS prompt_id,  -- 明确别名
    cp.title,
    cp.content,
    cp.category_name,
    cp.category_slug,
    cp.model,
    cp.description,
    cp.tags,
    cp.view_count,
    cp.copy_count,
    cp.like_count,
    cp.published_at,
    cp.created_at,
    cp.user_id,
    up.display_name AS user_display_name,
    up.avatar_url AS user_avatar_url
  FROM community_prompts cp
  LEFT JOIN user_profiles up ON cp.user_id = up.user_id
  WHERE cp.user_id = p_user_id
    AND cp.status = 'published'
  ORDER BY cp.published_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 验证
DO $$
BEGIN
  RAISE NOTICE '✅ get_user_prompts_with_profile 函数已更新';
  RAISE NOTICE '   - id 字段重命名为 prompt_id';
  RAISE NOTICE '   - 所有字段都明确指定了表前缀';
END $$;
