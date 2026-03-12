-- 修复用户档案相关函数的 SQL 错误

-- 修复 get_user_prompts 函数，添加用户信息
CREATE OR REPLACE FUNCTION get_user_prompts_with_profile(
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
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
    cp.id,
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

-- 确保 get_user_profile_stats 正确工作
DROP FUNCTION IF EXISTS get_user_profile_stats(UUID);

CREATE OR REPLACE FUNCTION get_user_profile_stats(p_user_id UUID)
RETURNS TABLE (
  prompt_count BIGINT,
  total_likes BIGINT,
  total_copies BIGINT,
  total_views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS prompt_count,
    COALESCE(SUM(like_count), 0)::BIGINT AS total_likes,
    COALESCE(SUM(copy_count), 0)::BIGINT AS total_copies,
    COALESCE(SUM(view_count), 0)::BIGINT AS total_views
  FROM community_prompts
  WHERE user_id = p_user_id
    AND status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
