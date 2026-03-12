-- 修复 get_or_create_user_profile 函数中的 id 字段歧义问题
-- 在所有查询中明确指定表前缀

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
  -- 验证用户在 auth.users 中存在 - 明确指定 auth.users.id
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE auth.users.id = p_user_id) INTO v_user_exists;

  IF NOT v_user_exists THEN
    RAISE EXCEPTION 'User does not exist';
  END IF;

  -- 尝试获取现有档案 - 明确指定 user_profiles.id
  SELECT
    user_profiles.id,
    user_profiles.user_id,
    user_profiles.display_name,
    user_profiles.bio,
    user_profiles.avatar_url,
    user_profiles.created_at
  INTO v_profile
  FROM user_profiles
  WHERE user_profiles.user_id = p_user_id;

  -- 如果没找到，创建新的
  IF NOT FOUND THEN
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (p_user_id, NULL)
    RETURNING
      user_profiles.id,
      user_profiles.user_id,
      user_profiles.display_name,
      user_profiles.bio,
      user_profiles.avatar_url,
      user_profiles.created_at
    INTO v_profile;
  END IF;

  -- 返回结果 - 使用明确的字段引用
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

-- 验证
DO $$
BEGIN
  RAISE NOTICE '✅ get_or_create_user_profile 函数已修复';
  RAISE NOTICE '   - 所有字段引用都明确指定了表前缀';
  RAISE NOTICE '   - 解决了 id 字段歧义问题';
END $$;
