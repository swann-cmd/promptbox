-- 重新创建完整的用户档案系统
-- 先删除所有可能存在的旧函数，然后重新创建

-- 1. 删除所有用户档案相关函数
DROP FUNCTION IF EXISTS get_or_create_user_profile(UUID);
DROP FUNCTION IF EXISTS update_user_profile(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_user_profile_stats(UUID);
DROP FUNCTION IF EXISTS get_user_prompts_with_profile(UUID, INT, INT);

-- 2. 重新创建 get_or_create_user_profile
CREATE OR REPLACE FUNCTION get_or_create_user_profile(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_profile RECORD;
  v_user_exists BOOLEAN;
BEGIN
  -- 验证用户在 auth.users 中存在
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) INTO v_user_exists;

  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;

  -- 尝试获取现有档案
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE user_profiles.user_id = p_user_id;

  -- 如果没找到，创建新的
  IF NOT FOUND THEN
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (p_user_id, NULL)
    RETURNING * INTO v_profile;
  END IF;

  RETURN QUERY
  SELECT
    v_profile.id,
    v_profile.user_id,
    v_profile.display_name,
    v_profile.bio,
    v_profile.avatar_url,
    v_profile.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 重新创建 update_user_profile
CREATE OR REPLACE FUNCTION update_user_profile(
  p_display_name TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_current_user UUID;
  v_profile RECORD;
BEGIN
  -- 获取当前用户 ID
  v_current_user := auth.uid();

  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- 更新用户档案
  UPDATE user_profiles
  SET
    display_name = COALESCE(p_display_name, user_profiles.display_name),
    bio = COALESCE(p_bio, user_profiles.bio),
    avatar_url = COALESCE(p_avatar_url, user_profiles.avatar_url),
    updated_at = NOW()
  WHERE user_id = v_current_user
  RETURNING * INTO v_profile;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user';
  END IF;

  RETURN QUERY
  SELECT
    v_profile.id,
    v_profile.user_id,
    v_profile.display_name,
    v_profile.bio,
    v_profile.avatar_url,
    v_profile.created_at,
    v_profile.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 重新创建 get_user_profile_stats
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
    COUNT(cp.id)::BIGINT,
    COALESCE(SUM(cp.like_count), 0)::BIGINT,
    COALESCE(SUM(cp.copy_count), 0)::BIGINT,
    COALESCE(SUM(cp.view_count), 0)::BIGINT
  FROM community_prompts cp
  WHERE cp.user_id = p_user_id
    AND cp.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 重新创建 get_user_prompts_with_profile（使用 prompt_id 避免歧义）
CREATE OR REPLACE FUNCTION get_user_prompts_with_profile(
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  prompt_id UUID,
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
    cp.id AS prompt_id,
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
  RAISE NOTICE '✅ 所有用户档案函数已重新创建';
  RAISE NOTICE '   - get_or_create_user_profile';
  RAISE NOTICE '   - update_user_profile';
  RAISE NOTICE '   - get_user_profile_stats';
  RAISE NOTICE '   - get_user_prompts_with_profile (使用 prompt_id)';
END $$;
