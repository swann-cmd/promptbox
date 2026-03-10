# PromptBox

一个基于 React + Supabase 的 Prompt 管理工具，帮助你轻松管理和组织你的 AI Prompts。

## 功能特性

- 🔐 用户认证（登录/注册）
- 📝 创建和管理 Prompts
- 🏷️ 标签分类
- 🔍 搜索功能
- 📋 一键复制
- 🎨 现代化 UI（Tailwind CSS）

## 技术栈

- **前端框架**: React 19 + Vite
- **UI 框架**: Tailwind CSS
- **后端服务**: Supabase
- **状态管理**: React Context API

## 项目结构

```
src/
├── components/
│   ├── auth/          # 认证相关组件
│   │   ├── AuthPage.jsx
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── prompt/        # Prompt 相关组件
│   │   ├── PromptCard.jsx
│   │   ├── PromptList.jsx
│   │   ├── PromptForm.jsx
│   │   └── PromptDetail.jsx
│   ├── common/        # 通用组件
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Textarea.jsx
│   │   └── Modal.jsx
│   └── HomePage.jsx   # 主页面
├── context/           # Context
│   └── AuthContext.jsx
├── utils/             # 工具函数
│   └── supabaseClient.js
├── App.jsx            # 根组件
├── main.jsx           # 入口文件
└── index.css          # 全局样式
```

## 开始使用

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

在 [Supabase](https://supabase.com) 创建一个新项目，然后：

1. 创建 `.env.local` 文件：
   ```bash
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local`，填入你的 Supabase 凭证：
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. 设置数据库

在 Supabase Dashboard 的 SQL Editor 中运行 `supabase/migrations/001_create_prompts_table.sql` 中的 SQL 语句，创建 `prompts` 表和相应的安全策略。

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 开始使用！

## 数据库表结构

### prompts 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 ID（外键） |
| title | TEXT | 标题 |
| content | TEXT | 内容 |
| tags | TEXT[] | 标签数组 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 功能说明

### 认证
- 使用 Supabase Auth 进行用户认证
- 支持邮箱密码注册和登录
- 自动管理会话状态

### Prompts 管理
- 创建、编辑、删除 Prompts
- 按标签分类
- 搜索 Prompts（标题、内容、标签）
- 查看详情并复制内容

### 安全策略
- 行级安全策略（RLS）确保用户只能访问自己的数据
- 所有操作都需要用户认证

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

## 开发工作流

本项目使用 **Feature Branch 工作流**，确保生产环境稳定。

详细说明请查看：[WORKFLOW.md](./WORKFLOW.md)

## 开发计划

- [ ] 添加 Prompt 模板功能
- [ ] 支持导入/导出 Prompts
- [ ] 添加 Prompt 使用统计
- [ ] 支持多语言
- [ ] 添加 Prompt 分享功能
