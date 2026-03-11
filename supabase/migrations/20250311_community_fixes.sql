-- Fix critical and important issues from code review
-- Run this migration after the initial community features migration

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add validation to publish_to_community function
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
-- 2. Add composite index for popular tab query optimization
-- ─────────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_community_prompts_like_copy_count
ON community_prompts(like_count DESC, copy_count DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Create rate limiting tables and functions
-- ─────────────────────────────────────────────────────────────────────────────

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action_time
ON rate_limits(user_id, action_type, timestamp DESC);

-- Clean up old rate limit entries (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS VOID AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE timestamp < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Update toggle_like with rate limiting
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION toggle_like(p_community_prompt_id UUID)
RETURNS JSON AS $$
DECLARE
  v_is_liked BOOLEAN;
  v_like_count INTEGER;
  v_recent_actions INTEGER;
BEGIN
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Update toggle_favorite with rate limiting
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION toggle_favorite(p_community_prompt_id UUID)
RETURNS JSON AS $$
DECLARE
  v_is_favorited BOOLEAN;
  v_favorite_count INTEGER;
  v_recent_actions INTEGER;
BEGIN
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
-- 6. Optimize user interactions query with combined function
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_interactions_optimized(p_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  v_target_user_id UUID := COALESCE(p_user_id, auth.uid());
  v_liked UUID[];
  v_favorited UUID[];
BEGIN
  -- Get liked prompt IDs
  SELECT ARRAY_AGG(community_prompt_id) INTO v_liked
  FROM community_likes
  WHERE user_id = v_target_user_id;

  -- Get favorited prompt IDs
  SELECT ARRAY_AGG(community_prompt_id) INTO v_favorited
  FROM community_favorites
  WHERE user_id = v_target_user_id;

  RETURN json_build_object(
    'likedIds', COALESCE(v_liked, ARRAY[]::UUID[]),
    'favoritedIds', COALESCE(v_favorited, ARRAY[]::UUID[])
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Enable RLS for rate_limits table
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits"
  ON rate_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits"
  ON rate_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Create a scheduled job function to clean up old rate limits
--    (This should be called by a cron job or pg_cron extension)
-- ─────────────────────────────────────────────────────────────────────────────

-- This function can be called periodically to clean up old rate limit entries
-- SELECT cleanup_old_rate_limits();
