-- 添加用户验证到 get_or_create_user_profile 函数

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

-- 添加索引以提升性能
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
