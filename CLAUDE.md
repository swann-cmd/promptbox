# 用户信息

## 基本信息
- **姓名**: Peter
- **职业**: 产品经理

## 更新记录
- 2026-01-21: 创建用户档案

# gstack

gstack 是一套强大的开发工具集，包含 18 个专业角色和 7 个强大工具。

## 重要规则

1. **网页浏览**: 始终使用 gstack 的 `/browse` skill 进行所有网页浏览，绝不使用 `mcp__claude-in-chrome__*` 工具
2. **技能可用**: 如果 gstack skills 不工作，运行 `cd .claude/skills/gstack && ./setup` 来构建二进制文件并注册 skills

## 可用技能

### 核心开发流程 (Think → Plan → Build → Review → Test → Ship → Reflect)

- `/office-hours` - YC Office Hours: 从这里开始。六个强制性问题在编写代码前重新构建产品
- `/plan-ceo-review` - CEO/Founder: 重新思考问题，找到隐藏的 10 星产品
- `/plan-eng-review` - Engineering Manager: 确定架构、数据流、图表、边缘情况和测试
- `/plan-design-review` - Senior Designer: 评估每个设计维度 0-10 分，并编辑计划以达到目标
- `/design-consultation` - Design Partner: 从零开始构建完整的设计系统
- `/review` - Staff Engineer: 发现在 CI 中通过但在生产中爆炸的 bug
- `/investigate` - Debugger: 系统性根因调试
- `/design-review` - Designer Who Codes: 与 /plan-design-review 相同的审核，然后修复发现的问题
- `/qa` - QA Lead: 测试应用，发现 bug，用原子提交修复，重新验证
- `/qa-only` - QA Reporter: 与 /qa 相同的方法论，但仅报告
- `/ship` - Release Engineer: 同步 main，运行测试，审核覆盖率，推送，打开 PR
- `/land-and-deploy` - Release Engineer: 合并 PR，等待 CI 和部署，验证生产健康
- `/canary` - SRE: 部署后监控循环
- `/benchmark` - Performance Engineer: 基线页面加载时间和 Core Web Vitals
- `/document-release` - Technical Writer: 更新所有项目文档以匹配刚发布的内容
- `/retro` - Eng Manager: 团队周回顾

### 工具

- `/browse` - QA Engineer: 给 agent 眼睛。真实的 Chromium 浏览器，真实的点击，真实的截图
- `/setup-browser-cookies` - Session Manager: 从真实浏览器导入 cookies
- `/codex` - Second Opinion: 来自 OpenAI Codex CLI 的独立代码审查
- `/careful` - Safety Guardrails: 在破坏性命令前警告
- `/freeze` - Edit Lock: 将文件编辑限制在一个目录
- `/guard` - Full Safety: `/careful` + `/freeze` 合一
- `/unfreeze` - Unlock: 移除 `/freeze` 边界
- `/setup-deploy` - Deploy Configurator: `/land-and-deploy` 的一次性设置
- `/gstack-upgrade` - Self-Updater: 升级 gstack 到最新版本

## 推荐工作流

1. 新功能想法 → `/office-hours` (重新构建产品)
2. 设计阶段 → `/plan-ceo-review` + `/plan-eng-review` + `/design-consultation`
3. 实现阶段 → 编写代码
4. **代码质量检查** → `/review` + 查看 [CODE_QUALITY_WORKFLOW.md](./CODE_QUALITY_WORKFLOW.md)
5. 测试阶段 → `/qa` 或手动测试
6. 部署阶段 → `/ship` → `/land-and-deploy` → `/canary`

### PromptBox 项目特定工作流

- **[WORKFLOW.md](./WORKFLOW.md)** - Git 分支策略和部署流程
- **[CODE_QUALITY_WORKFLOW.md](./CODE_QUALITY_WORKFLOW.md)** - 代码审核和简化指南
- **[TESTING_WORKFLOW.md](./TESTING_WORKFLOW.md)** - 测试工作流

### 代码质量检查清单

```bash
# 1. 开发前
git checkout -b feature/your-feature

# 2. 开发中
npm test        # 保持测试通过

# 3. 提交前检查
git diff --stat # 查看改动量
# 如果改动 > 200 行，考虑先简化

# 4. 代码审核（重要！）
# 涉及以下内容必须审核：
# ✅ 数据库操作
# ✅ 用户输入处理
# ✅ 权限控制
# ✅ 支付认证

# 5. 提交
git add .
git commit -m "feat: 清晰的提交信息"
git push
```

了解更多: https://github.com/garrytan/gstack
