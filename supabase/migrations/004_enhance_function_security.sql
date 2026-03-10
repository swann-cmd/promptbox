-- 增强数据库函数安全性
-- 为 increment_usage_count 添加更严格的权限验证

-- 更新函数：增加使用计数（增强版）
CREATE OR REPLACE FUNCTION increment_usage_count(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
  -- 验证 prompt 存在且属于当前用户
  IF NOT EXISTS (
    SELECT 1 FROM prompts
    WHERE id = prompt_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Prompt not found or access denied' USING ERRCODE = '42501';
  END IF;

  -- 更新使用计数
  UPDATE prompts
  SET usage_count = usage_count + 1
  WHERE id = prompt_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 添加注释
COMMENT ON FUNCTION increment_usage_count IS '增加 prompt 使用计数，包含严格的权限验证';
