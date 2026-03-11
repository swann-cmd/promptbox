-- PromptBox Community Features Migration
-- This migration creates the database schema for the community feature

-- ─────────────────────────────────────────────────────────────────────────────
-- Table Creation
-- ─────────────────────────────────────────────────────────────────────────────

-- 社区提示词表
CREATE TABLE IF NOT EXISTS community_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '通用',
  description TEXT,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  copy_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 点赞表
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_prompt_id UUID NOT NULL REFERENCES community_prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(community_prompt_id, user_id)
);

-- 收藏表
CREATE TABLE IF NOT EXISTS community_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_prompt_id UUID NOT NULL REFERENCES community_prompts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(community_prompt_id, user_id)
);

-- 用户档案表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────

-- community_prompts indexes
CREATE INDEX IF NOT EXISTS idx_community_prompts_user_id ON community_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_prompts_status ON community_prompts(status);
CREATE INDEX IF NOT EXISTS idx_community_prompts_created_at ON community_prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_prompts_like_count ON community_prompts(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_prompts_copy_count ON community_prompts(copy_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_prompts_category_slug ON community_prompts(category_slug);

-- community_likes indexes
CREATE INDEX IF NOT EXISTS idx_community_likes_prompt_id ON community_likes(community_prompt_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON community_likes(user_id);

-- community_favorites indexes
CREATE INDEX IF NOT EXISTS idx_community_favorites_prompt_id ON community_favorites(community_prompt_id);
CREATE INDEX IF NOT EXISTS idx_community_favorites_user_id ON community_favorites(user_id);

-- user_profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS (Row Level Security) Policies
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS
ALTER TABLE community_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- community_promts policies
CREATE POLICY "Anyone can view published community prompts"
  ON community_prompts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can insert own community prompts"
  ON community_prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own community prompts"
  ON community_prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own community prompts"
  ON community_prompts FOR DELETE
  USING (auth.uid() = user_id);

-- community_likes policies
CREATE POLICY "Anyone can view likes"
  ON community_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own likes"
  ON community_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own likes"
  ON community_likes FOR DELETE
  USING (auth.uid() = user_id);

-- community_favorites policies
CREATE POLICY "Anyone can view favorites"
  ON community_favorites FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own favorites"
  ON community_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own favorites"
  ON community_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- user_profiles policies
CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Database Functions
-- ─────────────────────────────────────────────────────────────────────────────

-- 发布提示词到社区
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

-- 检查用户是否已点赞
CREATE OR REPLACE FUNCTION check_user_liked(p_community_prompt_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM community_likes
    WHERE community_prompt_id = p_community_prompt_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 检查用户是否已收藏
CREATE OR REPLACE FUNCTION check_user_favorited(p_community_prompt_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM community_favorites
    WHERE community_prompt_id = p_community_prompt_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 点赞/取消点赞
CREATE OR REPLACE FUNCTION toggle_like(p_community_prompt_id UUID)
RETURNS JSON AS $$
DECLARE
  v_is_liked BOOLEAN;
  v_like_count INTEGER;
BEGIN
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
  END IF;

  -- 获取更新后的点赞数
  SELECT like_count INTO v_like_count FROM community_prompts WHERE id = p_community_prompt_id;
  RETURN json_build_object('isLiked', NOT v_is_liked, 'likeCount', v_like_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 收藏/取消收藏
CREATE OR REPLACE FUNCTION toggle_favorite(p_community_prompt_id UUID)
RETURNS JSON AS $$
DECLARE
  v_is_favorited BOOLEAN;
  v_favorite_count INTEGER;
BEGIN
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
  END IF;

  -- 计算收藏数（需要在应用层聚合，这里简单返回状态）
  SELECT COUNT(*) INTO v_favorite_count FROM community_favorites WHERE community_prompt_id = p_community_prompt_id;
  RETURN json_build_object('isFavorited', NOT v_is_favorited, 'favoriteCount', v_favorite_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 复制社区提示词到个人库
CREATE OR REPLACE FUNCTION copy_community_prompt(p_community_prompt_id UUID, p_category_id UUID DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  v_community_prompt RECORD;
  v_new_prompt_id UUID;
BEGIN
  -- 获取社区提示词信息
  SELECT * INTO v_community_prompt
  FROM community_prompts
  WHERE id = p_community_prompt_id AND status = 'published';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Community prompt not found';
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

-- 撤回社区提示词
CREATE OR REPLACE FUNCTION withdraw_community_prompt(p_community_prompt_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_prompt RECORD;
BEGIN
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

-- 增加浏览次数
CREATE OR REPLACE FUNCTION increment_view_count(p_community_prompt_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_prompts
  SET view_count = view_count + 1
  WHERE id = p_community_prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户收藏列表
CREATE OR REPLACE FUNCTION get_user_favorites(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  community_prompt_id UUID,
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
  favorited_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_target_user_id UUID := COALESCE(p_user_id, auth.uid());
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.id AS community_prompt_id,
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
    cf.created_at AS favorited_at
  FROM community_favorites cf
  JOIN community_prompts cp ON cf.community_prompt_id = cp.id
  WHERE cf.user_id = v_target_user_id
    AND cp.status = 'published'
  ORDER BY cf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
