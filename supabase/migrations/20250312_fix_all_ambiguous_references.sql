-- 修复所有存在 user_id 歧义的函数

-- 1. 修复 get_or_create_user_profile 函数
DROP FUNCTION IF EXISTS get_or_create_user_profile(UUID);

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
BEGIN
  -- Try to get existing profile
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE user_profiles.user_id = p_user_id;

  -- If not found, create a new one
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

-- 2. 修复 update_user_profile 函数
DROP FUNCTION IF EXISTS update_user_profile(TEXT, TEXT, TEXT);

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
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_profile RECORD;
BEGIN
  -- Update profile
  UPDATE user_profiles
  SET
    display_name = COALESCE(p_display_name, display_name),
    bio = COALESCE(p_bio, bio),
    avatar_url = COALESCE(p_avatar_url, avatar_url)
  WHERE user_profiles.user_id = auth.uid()
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
    v_profile.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 确保 get_user_prompts_with_profile 正确（已创建过，这里确保表名明确）
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
