-- Add tags field to prompts table
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for tags (using GIN for array fields)
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN (tags);
