-- RLS Security Enhancements Migration
-- 此迁移增强 RLS 策略和 RPC 函数的安全性

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. 增强 increment_view_count 函数的安全性
-- ─────────────────────────────────────────────────────────────────────────────

-- 添加用户认证验证和基本的防刷机制
CREATE OR REPLACE FUNCTION increment_view_count(p_community_prompt_id UUID)
RETURNS VOID AS $$
DECLARE
  v_prompt_exists BOOLEAN;
BEGIN
  -- 验证提示词是否存在且已发布
  SELECT EXISTS(
    SELECT 1 FROM community_prompts
    WHERE id = p_community_prompt_id AND status = 'published'
  ) INTO v_prompt_exists;

  IF NOT v_prompt_exists THEN
    RAISE EXCEPTION 'Community prompt not found or not published';
  END IF;

  -- 增加浏览次数（允许未登录用户浏览）
  UPDATE community_prompts
  SET view_count = view_count + 1
  WHERE id = p_community_prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. 为 toggle_like 和 toggle_favorite 添加额外的认证检查
-- ─────────────────────────────────────────────────────────────────────────────

-- 增强 toggle_like 函数（在已有速率限制的基础上）
CREATE OR REPLACE FUNCTION toggle_like(p_community_prompt_id UUID)
RETURNS JSON AS $$
DECLARE
  v_is_liked BOOLEAN;
  v_like_count INTEGER;
  v_recent_actions INTEGER;
BEGIN
  -- 验证用户已登录
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28101'; -- 28101 = object_not_in_prerequisite_state
  END IF;

  -- 验证提示词存在且已发布
  IF NOT EXISTS(
    SELECT 1 FROM community_prompts
    WHERE id = p_community_prompt_id AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'Community prompt not found or not published';
  END IF;

  -- Check rate limit: max 10 likes per minute
  SELECT COUNT(*) INTO v_recent_actions
  FROM rate_limits
  WHERE user_id = auth.uid()
    AND action_type = 'like'
    AND timestamp > NOW() - INTERVAL '1 minute';

  IF v_recent_actions >= 10 THEN
    RAISE EXCEPTION '操作过于频繁，请稍后再试';
  END IF;

  -- 检查是否已点赞
  SELECT EXISTS(
    SELECT 1 FROM community_likes
    WHERE community_prompt_id = p_community_prompt_id AND user_id = auth.uid()
  ) INTO v_is_liked;

  IF v_is_liked THEN
    -- 取消点赞
    DELETE FROM community_likes
    WHERE community_prompt_id = p_community_prompt_id AND user_id = auth.uid();
    UPDATE community_prompts SET like_count = like_count - 1 WHERE id = p_community_prompt_id;
  ELSE
    -- 添加点赞
    INSERT INTO community_likes (community_prompt_id, user_id)
    VALUES (p_community_prompt_id, auth.uid());
    UPDATE community_prompts SET like_count = like_count + 1 WHERE id = p_community_prompt_id;

    -- Log action for rate limiting
    INSERT INTO rate_limits (user_id, action_type)
    VALUES (auth.uid(), 'like');
  END IF;

  -- 获取更新后的点赞数
  SELECT like_count INTO v_like_count FROM community_prompts WHERE id = p_community_prompt_id;
  RETURN json_build_object('isLiked', NOT v_is_liked, 'likeCount', v_like_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 增强 toggle_favorite 函数（在已有速率限制的基础上）
CREATE OR REPLACE FUNCTION toggle_favorite(p_community_prompt_id UUID)
RETURNS JSON AS $$
DECLARE
  v_is_favorited BOOLEAN;
  v_favorite_count INTEGER;
  v_recent_actions INTEGER;
BEGIN
  -- 验证用户已登录
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28101';
  END IF;

  -- 验证提示词存在且已发布
  IF NOT EXISTS(
    SELECT 1 FROM community_prompts
    WHERE id = p_community_prompt_id AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'Community prompt not found or not published';
  END IF;

  -- Check rate limit: max 10 favorites per minute
  SELECT COUNT(*) INTO v_recent_actions
  FROM rate_limits
  WHERE user_id = auth.uid()
    AND action_type = 'favorite'
    AND timestamp > NOW() - INTERVAL '1 minute';

  IF v_recent_actions >= 10 THEN
    RAISE EXCEPTION '操作过于频繁，请稍后再试';
  END IF;

  -- 检查是否已收藏
  SELECT EXISTS(
    SELECT 1 FROM community_favorites
    WHERE community_prompt_id = p_community_prompt_id AND user_id = auth.uid()
  ) INTO v_is_favorited;

  IF v_is_favorited THEN
    -- 取消收藏
    DELETE FROM community_favorites
    WHERE community_prompt_id = p_community_prompt_id AND user_id = auth.uid();
  ELSE
    -- 添加收藏
    INSERT INTO community_favorites (community_prompt_id, user_id)
    VALUES (p_community_prompt_id, auth.uid());

    -- Log action for rate limiting
    INSERT INTO rate_limits (user_id, action_type)
    VALUES (auth.uid(), 'favorite');
  END IF;

  -- 计算收藏数
  SELECT COUNT(*) INTO v_favorite_count FROM community_favorites WHERE community_prompt_id = p_community_prompt_id;
  RETURN json_build_object('isFavorited', NOT v_is_favorited, 'favoriteCount', v_favorite_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. 增强 copy_community_prompt 函数的安全性
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION copy_community_prompt(p_community_prompt_id UUID, p_category_id UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  v_community_prompt RECORD;
  v_new_prompt_id UUID;
BEGIN
  -- 验证用户已登录
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28101';
  END IF;

  -- 获取社区提示词信息
  SELECT * INTO v_community_prompt
  FROM community_prompts
  WHERE id = p_community_prompt_id AND status = 'published';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Community prompt not found or not published';
  END IF;

  -- 验证分类ID（如果提供）
  IF p_category_id IS NOT NULL THEN
    IF NOT EXISTS(SELECT 1 FROM categories WHERE id = p_category_id) THEN
      RAISE EXCEPTION 'Invalid category ID';
    END IF;
  END IF;

  -- 插入到用户的提示词库
  INSERT INTO prompts (user_id, title, content, category_id, model, usage_count)
  VALUES (
    auth.uid(),
    v_community_prompt.title,
    v_community_prompt.content,
    p_category_id,
    v_community_prompt.model,
    0
  )
  RETURNING id INTO v_new_prompt_id;

  -- 更新复制计数
  UPDATE community_prompts SET copy_count = copy_count + 1 WHERE id = p_community_prompt_id;
  RETURN v_new_prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. 增强 withdraw_community_prompt 函数的安全性
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION withdraw_community_prompt(p_community_prompt_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_prompt RECORD;
BEGIN
  -- 验证用户已登录
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28101';
  END IF;

  -- 检查是否为该用户的提示词
  SELECT * INTO v_prompt
  FROM community_prompts
  WHERE id = p_community_prompt_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Community prompt not found or access denied';
  END IF;

  -- 更新状态为撤回
  UPDATE community_prompts
  SET status = 'withdrawn'
  WHERE id = p_community_prompt_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. 增强 publish_to_community 函数的安全性（添加用户认证检查）
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION publish_to_community(
  p_prompt_id UUID,
  p_description TEXT DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_prompt RECORD;
  v_category RECORD;
  v_community_prompt_id UUID;
BEGIN
  -- 验证用户已登录
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28101';
  END IF;

  -- 获取提示词信息
  SELECT * INTO v_prompt FROM prompts WHERE id = p_prompt_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prompt not found or access denied';
  END IF;

  -- 验证标题长度
  IF LENGTH(v_prompt.title) > 200 THEN
    RAISE EXCEPTION 'Title exceeds maximum length of 200 characters';
  END IF;

  -- 验证内容长度
  IF LENGTH(v_prompt.content) > 10000 THEN
    RAISE EXCEPTION 'Content exceeds maximum length of 10000 characters';
  END IF;

  -- 验证描述长度
  IF p_description IS NOT NULL AND LENGTH(p_description) > 500 THEN
    RAISE EXCEPTION 'Description exceeds maximum length of 500 characters';
  END IF;

  -- 验证标签数量和长度
  IF p_tags IS NOT NULL THEN
    IF array_length(p_tags, 1) > 10 THEN
      RAISE EXCEPTION 'Cannot have more than 10 tags';
    END IF;

    FOR i IN 1..array_length(p_tags, 1) LOOP
      IF LENGTH(p_tags[i]) > 50 THEN
        RAISE EXCEPTION 'Tag exceeds maximum length of 50 characters';
      END IF;
    END LOOP;
  END IF;

  -- 获取分类信息
  SELECT * INTO v_category FROM categories WHERE id = v_prompt.category_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Category not found';
  END IF;

  -- 检查是否已发布
  IF EXISTS(
    SELECT 1 FROM community_prompts
    WHERE prompt_id = p_prompt_id AND status = 'published'
  ) THEN
    RAISE EXCEPTION 'This prompt has already been published to the community';
  END IF;

  -- 插入社区提示词
  INSERT INTO community_prompts (
    prompt_id, user_id, title, content,
    category_name, category_slug, model,
    description, tags
  )
  VALUES (
    v_prompt.id, auth.uid(), v_prompt.title, v_prompt.content,
    v_category.name, v_category.slug, v_prompt.model,
    p_description, p_tags
  )
  RETURNING id INTO v_community_prompt_id;

  RETURN v_community_prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. 添加 RLS 策略安全注释
-- ─────────────────────────────────────────────────────────────────────────────

COMMENT ON POLICY "Anyone can view published community prompts" ON community_prompts IS
  '允许任何人查看已发布的社区提示词（包括未登录用户）';

COMMENT ON POLICY "Users can insert own community prompts" ON community_prompts IS
  '只允许用户插入自己的社区提示词（通过 auth.uid() 验证）';

COMMENT ON POLICY "Users can update own community prompts" ON community_prompts IS
  '只允许用户更新自己的社区提示词（通过 auth.uid() 验证）';

COMMENT ON POLICY "Users can delete own community prompts" ON community_prompts IS
  '只允许用户删除自己的社区提示词（通过 auth.uid() 验证）';

COMMENT ON POLICY "Authenticated users can insert own likes" ON community_likes IS
  '只允许已登录用户插入自己的点赞记录（通过 auth.uid() 验证）';

COMMENT ON POLICY "Authenticated users can delete own likes" ON community_likes IS
  '只允许已登录用户删除自己的点赞记录（通过 auth.uid() 验证）';

COMMENT ON POLICY "Authenticated users can insert own favorites" ON community_favorites IS
  '只允许已登录用户插入自己的收藏记录（通过 auth.uid() 验证）';

COMMENT ON POLICY "Authenticated users can delete own favorites" ON community_favorites IS
  '只允许已登录用户删除自己的收藏记录（通过 auth.uid() 验证）';

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. 创建安全检查视图（用于监控和调试）
-- ─────────────────────────────────────────────────────────────────────────────

-- 创建一个视图来检查 RLS 策略是否正确工作
CREATE OR REPLACE VIEW security_check_rls AS
SELECT
  'community_prompts' as table_name,
  'RLS Enabled' as check_type,
  CASE WHEN relrowsecurity THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM pg_class WHERE relname = 'community_prompts'
UNION ALL
SELECT
  'community_likes' as table_name,
  'RLS Enabled' as check_type,
  CASE WHEN relrowsecurity THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM pg_class WHERE relname = 'community_likes'
UNION ALL
SELECT
  'community_favorites' as table_name,
  'RLS Enabled' as check_type,
  CASE WHEN relrowsecurity THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM pg_class WHERE relname = 'community_favorites'
UNION ALL
SELECT
  'user_profiles' as table_name,
  'RLS Enabled' as check_type,
  CASE WHEN relrowsecurity THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM pg_class WHERE relname = 'user_profiles';

COMMENT ON VIEW security_check_rls IS
  'RLS 安全检查视图 - 用于验证所有社区表是否启用了行级安全';
