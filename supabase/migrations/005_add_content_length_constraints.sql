-- 添加内容长度限制约束

-- 为 prompts 表添加长度检查约束
ALTER TABLE prompts
  ADD CONSTRAINT title_length CHECK (char_length(title) <= 200),
  ADD CONSTRAINT content_length CHECK (char_length(content) <= 10000);

-- 添加注释
COMMENT ON CONSTRAINT title_length ON prompts IS '标题最大长度 200 字符';
COMMENT ON CONSTRAINT content_length ON prompts IS '内容最大长度 10000 字符';
