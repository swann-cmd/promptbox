# 🚀 PromptBox 社区功能上线检查清单

## ✅ 代码部署状态

### 已完成
- ✅ 代码已推送到 GitHub (commit: 618eea5)
- ✅ 本地构建测试通过
- ✅ 所有组件已实现并测试

---

## 📋 上线前检查清单

### 1. 数据库迁移（必须先完成）

在 Supabase Dashboard 中执行以下 SQL 文件（按顺序）：

#### ✅ 迁移文件 1: 社区功能基础表
```bash
文件: supabase/migrations/20250311_community_features.sql
```

**包含内容**：
- community_prompts 表（社区提示词）
- community_likes 表（点赞记录）
- community_favorites 表（收藏记录）
- user_profiles 表（用户档案）
- RLS 策略（行级安全）
- 数据库函数（发布、点赞、收藏、复制）

#### ✅ 迁移文件 2: 标签功能
```bash
文件: supabase/migrations/20250311_add_tags_to_prompts.sql
```

**包含内容**：
- prompts 表添加 tags 字段

#### ✅ 迁移文件 3: 安全和性能优化
```bash
文件: supabase/migrations/20250311_community_fixes.sql
```

**包含内容**：
- 速率限制表和函数
- 输入验证
- 复合索引优化
- 优化的查询函数

**验证迁移成功**：
```sql
-- 检查表是否创建
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('community_prompts', 'community_likes', 'community_favorites', 'rate_limits');

-- 检查索引是否创建
SELECT indexname FROM pg_indexes 
WHERE indexname LIKE '%community%' OR indexname = 'idx_community_prompts_like_copy_count';

-- 检查函数是否创建
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('publish_to_community', 'toggle_like', 'toggle_favorite', 'copy_community_prompt', 'get_user_interactions_optimized');
```

---

### 2. Vercel 部署（如果使用 Vercel）

#### 方式 A: 通过 Vercel Dashboard
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择 PromptBox 项目
3. 点击 "Deploy" → "Redeploy"
4. 等待部署完成（约 1-2 分钟）

#### 方式 B: 通过 CLI
```bash
npm install -g vercel
vercel --prod
```

#### 部署后验证
- [ ] 访问生产环境 URL
- [ ] 检查控制台无错误
- [ ] 测试社区功能入口

---

### 3. 功能验证测试

#### 🔓 未登录用户测试
- [ ] 可以看到社区入口按钮（登录页面右上角）
- [ ] 点击社区按钮可以打开社区广场
- [ ] 可以浏览社区提示词列表
- [ ] 搜索功能正常
- [ ] 分类筛选正常
- [ ] 可以打开提示词详情
- [ ] 点击"复制"按钮可以直接复制内容到剪贴板
- [ ] 点赞按钮显示"请先登录"提示
- [ ] 收藏按钮显示"请先登录"提示

#### 🔐 已登录用户测试
- [ ] 主界面有社区入口按钮
- [ ] 可以打开提示词详情
- [ ] 点击"发布到社区"按钮
- [ ] 发布弹窗自动填充分类标签
- [ ] 可以添加自定义标签
- [ ] 发布成功显示绿色勾图标
- [ ] 已发布提示词显示"已发布到社区"状态
- [ ] 社区广场可以看到自己发布的内容
- [ ] 点赞功能正常
- [ ] 收藏功能正常
- [ ] "复制到我的库"功能正常
- [ ] 复制后提示词出现在个人库中

#### 🔒 安全性测试
- [ ] 快速连续点赞 11 次，第 11 次显示"操作过于频繁"
- [ ] 尝试添加特殊字符标签被过滤
- [ ] 未登录用户点赞显示"请先登录"

#### ⚡ 性能测试
- [ ] 社区页面加载速度正常
- [ ] 切换 Tab（最新/热门）响应迅速
- [ ] 快速操作不会出现内存泄漏警告

---

### 4. 监控配置

#### 错误监控（如果使用 Sentry）
```bash
# 检查 .env 配置
VITE_SENTRY_DSN=your_dsn_here
```

#### Analytics（如果使用）
- [ ] Google Analytics 配置正确
- [ ] 用户行为追踪正常

---

## 🎯 上线后验证清单

### 核心功能
- [ ] 用户可以正常登录/注册
- [ ] 提示词 CRUD 功能正常
- [ ] 社区广场可访问
- [ ] 发布功能正常
- [ ] 社交互动功能正常

### 数据完整性
- [ ] 数据库 RLS 策略生效（用户只能看到自己的数据）
- [ ] 速率限制正常工作
- [ ] 输入验证正常过滤

### 用户体验
- [ ] 页面加载速度正常
- [ ] 无控制台错误
- [ ] 移动端显示正常
- [ ] 错误提示友好

---

## 📞 回滚计划

如果上线后发现严重问题：

### 1. 代码回滚
```bash
# 回滚到上一个版本
git revert HEAD
git push origin main

# 或回滚到指定 commit
git reset --hard 1a159c5
git push -f origin main
```

### 2. 数据库回滚（谨慎操作）
```sql
-- 删除社区相关表（会丢失所有社区数据）
DROP TABLE IF EXISTS community_prompts CASCADE;
DROP TABLE IF EXISTS community_likes CASCADE;
DROP TABLE IF EXISTS community_favorites CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS rate_limits CASCADE;

-- 删除 prompts 表的 tags 字段
ALTER TABLE prompts DROP COLUMN IF EXISTS tags;
```

⚠️ **注意**: 数据库回滚会导致所有社区数据丢失，仅在严重问题时使用。

---

## 🎉 上线完成后的推广建议

### 1. 用户通知
- 在社区发布第一条欢迎提示词
- 添加"如何使用社区"的引导

### 2. 数据监控
- 关注社区活跃度
- 收集用户反馈
- 监控性能指标

### 3. 持续优化
- 根据用户反馈改进功能
- 优化热门推荐算法
- 添加更多社交功能（评论、关注等）

---

## 📞 紧急联系

如果遇到紧急问题：
1. 查看浏览器控制台错误信息
2. 检查 Supabase 日志
3. 查看 Vercel 部署日志
4. 回滚到上一个稳定版本

---

**祝上线顺利！🚀**

生成时间: 2026-03-11
