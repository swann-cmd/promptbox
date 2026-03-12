-- Add foreign key relationship between community_prompts and user_profiles
-- This allows JOIN queries between these tables

-- First, add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'community_prompts'
        AND column_name = 'user_profile_id'
    ) THEN
        ALTER TABLE community_prompts ADD COLUMN user_profile_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create a foreign key from community_prompts.user_id to user_profiles.user_id
-- This enables the JOIN we're using in the query
ALTER TABLE community_prompts
DROP CONSTRAINT IF EXISTS community_prompts_user_id_fkey;

ALTER TABLE community_prompts
ADD CONSTRAINT community_prompts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(user_id) ON DELETE CASCADE;
