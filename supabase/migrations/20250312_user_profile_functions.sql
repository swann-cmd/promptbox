-- PromptBox User Profile Functions Migration
-- This migration creates database functions for user profile management

-- ─────────────────────────────────────────────────────────────────────────────
-- User Profile Functions
-- ─────────────────────────────────────────────────────────────────────────────

-- Get or create user profile
-- Returns the user profile, creating one if it doesn't exist
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
  WHERE user_id = p_user_id;

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

-- Update user profile
-- Updates the user's profile information
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
  WHERE user_id = auth.uid()
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

-- Get user profile statistics
-- Returns aggregated statistics for a user
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
    COUNT(*) AS prompt_count,
    COALESCE(SUM(cp.like_count), 0) AS total_likes,
    COALESCE(SUM(cp.copy_count), 0) AS total_copies,
    COALESCE(SUM(cp.view_count), 0) AS total_views
  FROM community_prompts cp
  WHERE cp.user_id = p_user_id
    AND cp.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's published prompts
-- Returns all published community prompts for a user
CREATE OR REPLACE FUNCTION get_user_prompts(
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
  created_at TIMESTAMP WITH TIME ZONE
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
    cp.created_at
  FROM community_prompts cp
  WHERE cp.user_id = p_user_id
    AND cp.status = 'published'
  ORDER BY cp.published_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user profile with display name fallback
-- Helper function to safely get display name from profile or email
CREATE OR REPLACE FUNCTION get_user_display_name(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_display_name TEXT;
  v_email TEXT;
BEGIN
  -- Try to get display_name from profile
  SELECT up.display_name INTO v_display_name
  FROM user_profiles up
  WHERE up.user_id = p_user_id;

  -- If display_name exists, return it
  IF v_display_name IS NOT NULL AND LENGTH(TRIM(v_display_name)) > 0 THEN
    RETURN v_display_name;
  END IF;

  -- Fallback to email
  SELECT au.email INTO v_email
  FROM auth.users au
  WHERE au.id = p_user_id;

  -- Return email prefix if email exists
  IF v_email IS NOT NULL THEN
    RETURN SPLIT_PART(v_email, '@', 1);
  END IF;

  -- Final fallback
  RETURN '匿名用户';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
