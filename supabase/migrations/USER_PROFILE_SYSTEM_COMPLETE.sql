-- ============================================================================
-- PromptBox 用户档案系统 - 完整数据库迁移脚本
-- ============================================================================
-- 执行方式：在 Supabase Dashboard -> SQL Editor 中执行此文件
-- 创建时间：2026-03-12
-- 版本：v1.1.0
-- ============================================================================

-- ============================================================================
-- 第一部分：用户档案核心函数
-- ============================================================================

-- 1. 获取或创建用户档案
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

-- 2. 更新用户档案
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
  -- 更新档案
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

-- 3. 获取用户统计信息
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

-- 4. 获取用户发布的提示词（包含用户信息）
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

-- 5. 获取用户显示名称（辅助函数）
CREATE OR REPLACE FUNCTION get_user_display_name(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_display_name TEXT;
  v_email TEXT;
BEGIN
  -- 从档案获取 display_name
  SELECT up.display_name INTO v_display_name
  FROM user_profiles up
  WHERE up.user_id = p_user_id;

  -- 如果 display_name 存在，返回它
  IF v_display_name IS NOT NULL AND LENGTH(TRIM(v_display_name)) > 0 THEN
    RETURN v_display_name;
  END IF;

  -- 回退到 email
  SELECT au.email INTO v_email
  FROM auth.users au
  WHERE au.id = p_user_id;

  -- 返回 email 前缀
  IF v_email IS NOT NULL THEN
    RETURN SPLIT_PART(v_email, '@', 1);
  END IF;

  -- 最终回退
  RETURN '匿名用户';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 第二部分：添加性能索引
-- ============================================================================

-- 为 user_profiles.user_id 添加索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id 
ON user_profiles(user_id);

-- ============================================================================
-- 第三部分：为现有用户补充档案记录
-- ============================================================================

-- 为所有已经发布社区提示词的用户创建档案记录
INSERT INTO user_profiles (user_id, display_name)
SELECT 
    cp.user_id,
    COALESCE(
        SPLIT_PART(au.email, '@', 1),
        '用户'
    ) as display_name
FROM community_prompts cp
LEFT JOIN auth.users au ON cp.user_id = au.id
LEFT JOIN user_profiles up ON cp.user_id = up.user_id
WHERE up.user_id IS NULL
GROUP BY cp.user_id, au.email
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 第四部分：验证安装
-- ============================================================================

-- 验证函数创建成功
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '用户档案系统安装完成！';
  RAISE NOTICE '========================================';
  RAISE NOTICE '已创建的函数：';
  RAISE NOTICE '  ✓ get_or_create_user_profile';
  RAISE NOTICE '  ✓ update_user_profile';
  RAISE NOTICE '  ✓ get_user_profile_stats';
  RAISE NOTICE '  ✓ get_user_prompts_with_profile';
  RAISE NOTICE '  ✓ get_user_display_name';
  RAISE NOTICE '已创建的索引：';
  RAISE NOTICE '  ✓ idx_user_profiles_user_id';
  RAISE NOTICE '========================================';
END $$;

-- 查看安装结果
SELECT 
  routine_name as 函数名称,
  routine_type as 类型
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_or_create_user_profile',
  'update_user_profile',
  'get_user_profile_stats',
  'get_user_prompts_with_profile',
  'get_user_display_name'
)
ORDER BY routine_name;

-- 查看用户档案数量
SELECT 
  COUNT(*) as 用户档案数量,
  COUNT(*) FILTER (WHERE display_name IS NOT NULL) as 已设置昵称数量
FROM user_profiles;

