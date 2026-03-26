-- 添加数据库级标签验证触发器
-- 创建时间: 2026-03-26
-- 用途: 在数据库层面验证标签格式，防止 XSS 攻击

-- 标签验证函数
CREATE OR REPLACE FUNCTION validate_tags()
RETURNS TRIGGER AS $$
DECLARE
  tag TEXT;
BEGIN
  IF NEW.tags IS NOT NULL THEN
    -- 检查每个标签是否符合规则
    FOREACH tag IN ARRAY NEW.tags LOOP
      -- 检查标签长度（1-50 字符）
      IF LENGTH(tag) = 0 OR LENGTH(tag) > 50 THEN
        RAISE EXCEPTION '标签长度必须在 1-50 字符之间，当前: %', LENGTH(tag);
      END IF;

      -- 检查是否包含 HTML 实体编码（XSS 防护）
      IF tag ~ '&(?:#\d+|#x[\da-fA-F]+|[a-zA-Z]+);' THEN
        RAISE EXCEPTION '标签不能包含 HTML 实体编码: %', tag;
      END IF;

      -- 检查是否包含危险字符
      IF tag ~ '[<>"]' THEN
        RAISE EXCEPTION '标签不能包含 < > " 等特殊字符: %', tag;
      END IF;

      -- 只允许字母数字、中文、下划线和连字符
      IF NOT (tag ~ '^[a-zA-Z0-9\u4e00-\u9fa5_-]+$') THEN
        RAISE EXCEPTION '标签只能包含字母、数字、中文、下划线和连字符: %', tag;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为 prompts 表添加标签验证触发器
DROP TRIGGER IF EXISTS validate_prompts_tags ON prompts;
CREATE TRIGGER validate_prompts_tags
  BEFORE INSERT OR UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION validate_tags();

-- 为 community_prompts 表添加标签验证触发器
DROP TRIGGER IF EXISTS validate_community_prompts_tags ON community_prompts;
CREATE TRIGGER validate_community_prompts_tags
  BEFORE INSERT OR UPDATE ON community_prompts
  FOR EACH ROW
  EXECUTE FUNCTION validate_tags();

-- 添加注释
COMMENT ON FUNCTION validate_tags() IS '验证标签格式，防止 XSS 攻击';
COMMENT ON TRIGGER validate_prompts_tags ON prompts IS '验证 prompts 表的标签格式';
COMMENT ON TRIGGER validate_community_prompts_tags ON community_prompts IS '验证 community_prompts 表的标签格式';
