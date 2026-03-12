# 🚀 用户档案系统上线执行指南

## 当前状态
- ✅ 代码已推送到 GitHub (commit: c7a6f71)
- ⏳ 等待数据库迁移和 Vercel 部署

## 📋 执行步骤

### 步骤 1：数据库迁移（5分钟）

登录 [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor，按顺序执行以下 SQL：

#### 1.1 创建用户档案函数
```bash
# 复制文件内容并执行：
supabase/migrations/20250312_user_profile_functions.sql
```

#### 1.2 修复 SQL 歧义
```bash
# 复制文件内容并执行：
supabase/migrations/20250312_fix_all_ambiguous_references.sql
```

#### 1.3 添加验证和索引
```bash
# 复制文件内容并执行：
supabase/migrations/20250312_add_user_validation.sql
```

#### 1.4 为现有用户补充档案
```sql
INSERT INTO user_profiles (user_id, display_name)
SELECT
    cp.user_id,
    COALESCE(
        SPLIT_PART(au.email, '@', 1),
        '用户'
    ) as display_name
FROM community_prompts cp
LEFT JOIN auth.users au ON cp.user_id = au.id
LEFT JOIN user_profiles up ON cp.user_id = up.user_id
WHERE up.user_id IS NULL
GROUP BY cp.user_id, au.email
ON CONFLICT (user_id) DO NOTHING;
```

### 步骤 2：Vercel 自动部署（1-2分钟）

代码推送后，Vercel 会自动触发部署。

**检查部署状态**：
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到 PromptBox 项目
3. 查看部署进度

**或等待部署完成后访问生产环境 URL**

### 步骤 3：功能验证（5分钟）

#### 基础功能测试
- [ ] 注册新用户，检查是否自动创建档案
- [ ] 登录后点击右上角头像，能否打开编辑弹窗
- [ ] 修改昵称和简介，能否正确保存
- [ ] 保存后页面是否立即更新

#### 社区功能测试
- [ ] 社区提示词是否显示作者名称（不再是"匿名用户"）
- [ ] 社区提示词是否显示用户头像
- [ ] 点击作者名称是否能进入用户主页
- [ ] 用户主页是否显示统计数据
- [ ] 用户主页是否显示该用户发布的提示词
- [ ] 用户主页样式是否与首页一致

## ⚠️ 常见问题

### Q1: 社区提示词还是显示"匿名用户"
**A**: 请先执行步骤 1.4 为现有用户补充档案记录

### Q2: 点击用户名称报错 "column reference user_id is ambiguous"
**A**: 请确保已执行步骤 1.2 的迁移脚本

### Q3: Vercel 部署失败
**A**: 
1. 检查 Vercel 部署日志查看错误信息
2. 确认没有语法错误
3. 可以在本地运行 `npm run build` 测试构建

### Q4: 需要回滚怎么办
```bash
# 回滚到上一个版本
git revert HEAD
git push origin main

# 或在 Vercel Dashboard 找到上一个部署版本重新部署
```

## ✅ 上线完成

完成以上步骤后，用户档案系统就成功上线了！

建议在低峰时段进行上线，以便快速响应问题。

---
**生成时间**: 2026-03-12  
**版本**: v1.1.0 - 用户档案系统
