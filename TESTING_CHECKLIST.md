# 社区功能测试验证清单

## 🎯 数据库迁移后验证

### ✅ 验证迁移成功

在 Supabase SQL Editor 中运行以下查询验证：

```sql
-- 1. 验证新表创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'rate_limits';

-- 2. 验证新索引创建成功
SELECT indexname
FROM pg_indexes
WHERE indexname LIKE '%rate_limits%'
   OR indexname = 'idx_community_prompts_like_copy_count';

-- 3. 验证优化函数存在
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_user_interactions_optimized';
```

---

## 🧪 功能测试清单

### 🔐 安全性测试

#### 1. 认证检查测试
- [ ] **未登录点赞测试**
  1. 退出登录
  2. 打开社区页面
  3. 点击任意提示词的"点赞"按钮
  4. ✅ **预期**: 显示"请先登录"错误提示

#### 2. 速率限制测试
- [ ] **点赞速率限制**
  1. 登录后打开社区页面
  2. 快速连续点击同一个提示词的点赞按钮 10+ 次
  3. ✅ **预期**: 第 11 次点击时显示"操作过于频繁，请稍后再试"

#### 3. 输入验证测试
- [ ] **标签验证**
  1. 创建新提示词
  2. 尝试添加包含特殊字符的标签
  3. ✅ **预期**: 标签被拒绝或自动过滤特殊字符

---

### ⚡ 功能正确性测试

#### 4. 浏览计数测试
- [ ] **防止重复计数**
  1. 打开一个社区提示词详情
  2. 关闭详情页，再次打开
  3. ✅ **预期**: 浏览数只增加 1

#### 5. 状态同步测试
- [ ] **点赞状态同步**
  1. 在社区页面点击点赞
  2. 打开该提示词的详情页
  3. ✅ **预期**: 详情页显示相同的点赞状态

#### 6. 错误处理测试
- [ ] **错误边界测试**
  1. 打开浏览器控制台
  2. 在控制台执行: throw new Error("测试")
  3. ✅ **预期**: 显示友好的错误页面，不是白屏

---

### 🔍 性能测试

- [ ] 社区页面加载 < 1s
- [ ] 热门排行榜查询优化
- [ ] 用户互动状态加载快

---

## ✅ 验收标准

- [ ] 无控制台错误
- [ ] 无控制台警告
- [ ] 所有安全性测试通过
- [ ] 所有功能测试通过
- [ ] 性能可接受
- [ ] 无回归问题
