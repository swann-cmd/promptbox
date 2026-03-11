# 会话记录

## 项目信息
- **项目名称**：PromptBox
- **技术栈**：React 19 + Vite + Supabase + Tailwind CSS
- **部署平台**：Vercel
- **GitHub**：https://github.com/swann-cmd/promptbox
- **生产环境**：https://promptbox1-na4j8343y-swanito220-1362s-projects.vercel.app/

## 用户信息
- **姓名**：Peter
- **职业**：产品经理
- **GitHub**：petermo87 / swann-cmd
- **邮箱**：petermo87@gmail.com

## 开发流程
- 使用 **Feature Branch 工作流**
- 开发 → 本地测试 → 合并 PR → Vercel 自动部署
- Git 别名已配置：`git feature`, `git finish`, `git push-feature`

### ⚠️ 重要：分支提醒
**在开发新功能前，必须先创建功能分支！**

如果用户没有主动说创建分支，Claude 必须先询问：
> "是否需要创建一个新的功能分支来开发这个功能？"

**禁止直接在 main 分支进行功能开发！**

正确流程：
1. 用户提出新功能需求
2. Claude 确认是否需要创建分支
3. 执行 `git feature <功能名>` 创建分支
4. 在功能分支上开发
5. 本地测试通过
6. **⚠️ 提交前必须询问用户是否需要 code review**
7. 推送并合并到 main

## 环境变量
```env
VITE_SUPABASE_URL=https://xtpqilnjmkiewkgtessk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Supabase
- **项目 ID**：xtpqilnjmkiewkgtessk

## 已完成功能
- ✅ 用户认证（登录/注册）
- ✅ 创建和管理 Prompts
- ✅ 10 个分类系统：产品, 写作, 数据, 学习, AI, 创业, 思维, 个人效率, 开发, 视频
- ✅ 搜索功能
- ✅ 一键复制
- ✅ 详情页编辑功能
- ✅ CSV 导入功能（中文表头：标题,文案,分类）
- ✅ 下载导入模板
- ✅ 自动更新旧用户到新分类系统
- ✅ **导出 Prompts 功能（CSV、JSON、Markdown）**
- ✅ **Prompt 模板功能（11 个预设模板）**

## 待办功能
- [ ] 添加 Prompt 使用统计
- [ ] 支持多语言
- [ ] 添加 Prompt 分享功能

## 重要记录
### 2026-03-10
- 项目创建并成功部署（2小时38分钟）
- 配置了 Feature Branch 工作流
- 添加了详情页编辑功能
- 添加了 CSV 导入功能（导入限制：500条/4.5MB）
- 更新分类系统到10个分类
- 添加导入模板下载功能
- **安全审查和修复**：修复10个安全问题（代码质量 7/10 → 9/10）
  - 严重问题：CSV注入、环境变量验证、数据库权限
  - 高优先级：速率限制、自定义对话框、错误边界、内容限制
  - 优化：输入验证、CSV解析器、搜索性能
- **工作流程优化**：添加 code review 提醒机制
  - 每次功能开发完成、准备提交前，必须询问用户是否需要 code review
  - 使用 `feature-dev:code-reviewer` 技能进行代码审查
- **功能扩展**：
  - 修复分类 tab 重复显示的 bug
  - 优化手机端响应式布局（按钮图标、头像比例）
  - **导出 Prompts 功能**：支持 CSV、JSON、Markdown 三种格式
  - **Prompt 模板功能**：11个预设模板，双模式创建
- **代码审查和修复**：修复导出和模板功能的2个严重问题
  - 修复 ExportModal 内存泄漏风险（URL.revokeObjectURL 释放时机）
  - 修复 AddPromptModal 分类映射逻辑（使用 slug + name 双匹配 + 默认值）

## 备注
- 用户体验优先，字号不要太小
- 使用中文界面
- CSV 模板表头使用中文：标题,文案,分类

## 代码保存机制
- **代码文件**：自动保存（Edit/Write 工具自动保存到磁盘）
- **Git 提交**：手动提交（需要明确执行 git commit）
- **重要提醒**：
  - 完成功能后务必提交代码
  - 切换分支前检查是否有未提交的修改
  - 结束会话前提交所有更改
