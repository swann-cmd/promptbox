-- 删除当前用户的所有重复分类，保留每组中最早创建的那一个
WITH ranked_categories AS (
  SELECT
    id,
    user_id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY user_id, slug ORDER BY created_at ASC) as rn
  FROM categories
  WHERE user_id = auth.uid()
)
DELETE FROM categories
WHERE id IN (
  SELECT id FROM ranked_categories WHERE rn > 1
);
