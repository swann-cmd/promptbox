# PromptBox 开发工作流可视化

> **版本**: v1.0
> **更新时间**: 2026-03-22
> **适用范围**: 全栈开发、代码质量保证

---

## 🎯 完整工作流程图

```mermaid
graph TB
    Start([开始新功能]) --> Plan{计划阶段}
    Plan -->|复杂功能| OfficeHours[/office-hours<br/>重新构建产品/]
    Plan -->|需要设计| DesignReview[/plan-design-review<br/>设计审核/]
    Plan -->|技术方案| EngReview[/plan-eng-review<br/>架构审核/]

    OfficeHours --> Dev[开发阶段]
    DesignReview --> Dev
    EngReview --> Dev

    Dev --> CodeCheck{代码量检查}
    CodeCheck -->|> 200 行| SimplifyFirst[⚠️ 先简化代码]
    CodeCheck -->|≤ 200 行| QualityCheck{代码质量检查}

    SimplifyFirst --> QualityCheck

    QualityCheck -->|高风险| SecurityReview[/review<br/>安全审核/]
    QualityCheck -->|中等风险| QuickReview[快速自查]
    QualityCheck -->|低风险| Test[测试阶段]

    SecurityReview --> FixIssues{发现 issues?}
    FixIssues -->|是| FixCode[修复代码]
    FixIssues -->|否| Test
    FixCode --> QualityCheck

    QuickReview --> Test

    Test --> UnitTest[运行单元测试<br/>npm test]
    UnitTest --> Pass{测试通过?}
    Pass -->|否| Debug[/investigate<br/>调试/]
    Pass -->|是| Commit[提交代码]

    Debug --> FixCode

    Commit --> PreCommit{提交前检查}
    PreCommit -->|改动 > 100 行| Refactor[📦 考虑重构]
    PreCommit -->|改动 ≤ 100 行| Push[推送代码]

    Refactor --> Push

    Push --> PR{创建 PR?}
    PR -->|是| CreatePR[/ship<br/>创建 PR/]
    PR -->|否| Deploy[部署到生产]

    CreatePR --> ReviewPR{代码审查}
    ReviewPR -->|需要修改| ReviseCode[修改代码]
    ReviewPR -->|通过| MergePR[合并 PR]

    ReviseCode --> Commit

    MergePR --> Deploy
    Deploy --> Monitor[/canary<br/>监控部署/]
    Monitor --> Complete([完成])

    style Start fill:#e1f5e1
    style Complete fill:#e1f5e1
    style SecurityReview fill:#ffe1e1
    style SimplifyFirst fill:#fff4e1
    style Test fill:#e1f0ff
    style Deploy fill:#f0e1ff
```

---

## 🔍 详细阶段说明

### **阶段 1: 计划与设计** 📋

```mermaid
graph LR
    A[产品想法] --> B{复杂度评估}
    B -->|高复杂| C[CEO Review<br/>重新构建产品]
    B -->|需要设计| D[Design Review<br/>设计系统]
    B -->|技术方案| E[Eng Review<br/>架构设计]

    C --> F[详细计划]
    D --> F
    E --> F

    style A fill:#e1f5e1
    style F fill:#f0e1ff
```

**工具**: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`

---

### **阶段 2: 开发与代码质量** 💻

```mermaid
graph TB
    A[编写代码] --> B{代码量检查}
    B -->|> 300 行| C[⚠️ 需要重构]
    B -->|≤ 300 行| D{风险评估}

    C --> E[拆分组件<br/>提取 Hooks<br/>简化逻辑]
    E --> D

    D -->|高风险| F[🔒 安全审核<br/>SQL 注入<br/>XSS 防护<br/>权限控制]
    D -->|中风险| G[⚡ 快速自查<br/>代码规范<br/>命名清晰]
    D -->|低风险| H[✅ 直接测试]

    F --> I{修复问题?}
    I -->|是| J[修复代码]
    I -->|否| H
    J --> D

    style A fill:#e1f5e1
    style C fill:#ffe1e1
    style F fill:#ffe1e1
    style H fill:#e1f5e1
```

**代码质量检查清单:**

```yaml
高风险（必须审核）:
  - ✅ 数据库操作
  - ✅ 用户输入处理
  - ✅ 权限控制
  - ✅ 支付认证
  - ✅ 外部 API 调用

中风险（建议审核）:
  - ✅ 状态管理
  - ✅ 并发操作
  - ✅ 复杂算法
  - ✅ 性能敏感

低风险（快速检查）:
  - ✅ UI 样式调整
  - ✅ 文本修改
  - ✅ 简单重构
```

**工具**: `/review`, `/simplify`, ESLint, Prettier

---

### **阶段 3: 测试与调试** 🧪

```mermaid
graph TB
    A[运行测试] --> B{测试类型}
    B --> C[单元测试<br/>npm test]
    B --> D[集成测试]
    B --> E[E2E 测试<br/>/qa]

    C --> F{全部通过?}
    F -->|否| G[/investigate<br/>根因调试/]
    F -->|是| H[✅ 测试通过]

    G --> I[定位问题]
    I --> J[修复代码]
    J --> A

    E --> K[/qa-only<br/>问题报告/]
    K --> L{需要修复?}
    L -->|是| J
    L -->|否| H

    style A fill:#e1f5e1
    style G fill:#ffe1e1
    style H fill:#e1f5e1
```

**测试覆盖目标:**

```javascript
// 关键路径: 100% 覆盖
- 用户认证
- 支付流程
- 权限控制
- 数据操作

// 重要功能: >80% 覆盖
- 核心业务逻辑
- API 调用
- 状态管理

// UI 组件: >70% 覆盖
- 交互逻辑
- 表单验证
- 边界情况
```

**工具**: Vitest, `/qa`, `/qa-only`, `/investigate`

---

### **阶段 4: 提交与代码审查** 📝

```mermaid
graph TB
    A[提交代码] --> B{提交前检查}
    B --> C[git diff --stat<br/>查看改动量]

    C --> D{改动评估}
    D -->|> 200 行| E[⚠️ 考虑拆分]
    D -->|≤ 200 行| F[编写提交信息]

    E --> F

    F --> G[git commit<br/>清晰的提交信息]
    G --> H{推送到远程}

    H --> I[创建 PR]
    I --> J[/review<br/>自动代码审核]

    J --> K{审核结果}
    K -->|发现 issues| L[修复代码]
    K -->|通过| M[✅ 审核通过]

    L --> N[更新 PR]
    N --> J

    M --> O[合并到 main]

    style A fill:#e1f5e1
    style E fill:#fff4e1
    style M fill:#e1f5e1
    style O fill:#f0e1ff
```

**提交信息规范:**

```bash
# 格式
<type>(<scope>): <subject>

# 类型
feat:     新功能
fix:      Bug 修复
refactor: 重构（不改变功能）
docs:     文档更新
style:    代码格式（不影响功能）
test:     测试相关
chore:    构建/工具相关

# 示例
feat(community): 添加社区提示词发布功能
fix(auth): 修复登录状态丢失问题
refactor(ui): 提取可复用按钮组件
docs(workflow): 添加代码质量工作流指南
```

**工具**: `/ship`, `/review`, GitHub PR

---

### **阶段 5: 部署与监控** 🚀

```mermaid
graph TB
    A[合并到 main] --> B[/ship<br/>创建并推送 PR]
    B --> C[/land-and-deploy<br/>合并并部署]
    C --> D[CI/CD 流水线]

    D --> E[自动化测试]
    E --> F{测试通过?}
    F -->|否| G[❌ 部署失败]
    F -->|是| H[构建生产版本]

    G --> I[回滚到上一版本]
    I --> J[修复问题]
    J --> A

    H --> K[部署到生产]
    K --> L[/canary<br/>监控部署]

    L --> M{健康检查}
    M -->|发现问题| N[快速修复]
    M -->|一切正常| O[✅ 部署成功]

    N --> P[热修复]
    P --> K

    O --> Q[通知团队]
    Q --> R[更新文档<br/>/document-release]
    R --> S[完成]

    style A fill:#e1f5e1
    style G fill:#ffe1e1
    style O fill:#e1f5e1
    style S fill:#f0e1ff
```

**监控指标:**

```yaml
性能指标:
  - 页面加载时间 < 2.5s
  - Time to First Byte < 600ms
  - First Contentful Paint < 1.5s
  - Time to Interactive < 3.5s

错误监控:
  - JS 错误率 < 0.1%
  - API 失败率 < 0.5%
  - 404 错误率 < 1%

用户体验:
  - 核心功能可用率 > 99.9%
  - 平均响应时间 < 200ms
```

**工具**: `/land-and-deploy`, `/canary`, `/document-release`, Vercel

---

## 🎯 关键决策点

### **决策 1: 是否需要代码审核？**

```mermaid
graph TD
    A[代码变更] --> B{涉及安全?}
    B -->|是| C[🔒 必须审核]
    B -->|否| D{涉及数据?}

    D -->|是| C
    D -->|否| E{代码量 > 200?}

    E -->|是| F[⚠️ 建议审核]
    E -->|否| G{复杂逻辑?}

    G -->|是| F
    G -->|否| H[✅ 快速检查]

    style C fill:#ffe1e1
    style F fill:#fff4e1
    style H fill:#e1f5e1
```

### **决策 2: 是否需要代码简化？**

```mermaid
graph TD
    A[代码评估] --> B{组件 > 300 行?}
    B -->|是| C[📦 必须简化]
    B -->|否| D{函数 > 50 行?}

    D -->|是| C
    D -->|否| E{嵌套 > 3 层?}

    E -->|是| F[⚠️ 建议简化]
    E -->|否| G{重复代码?}

    G -->|是| F
    G -->|否| H{性能问题?}

    H -->|是| F
    H -->|否| I[✅ 继续开发]

    style C fill:#ffe1e1
    style F fill:#fff4e1
    style I fill:#e1f5e1
```

### **决策 3: 何时重构？**

```mermaid
graph TD
    A[技术债务累积] --> B{TODO > 10 个?}
    B -->|是| C[🔧 立即重构]
    B -->|否| D{开发变慢?}

    D -->|是| C
    D -->|否| E{频繁 Bug?}

    E -->|是| F[⚠️ 计划重构]
    E -->|否| G{新人困难?}

    G -->|是| F
    G -->|否| H[✅ 定期检查]

    style C fill:#ffe1e1
    style F fill:#fff4e1
    style H fill:#e1f5e1
```

---

## 📊 工作流效率指标

### **开发效率**

```mermaid
graph TD
    A[从想法到部署] --> B[计划: 1-2 天]
    B --> C[开发: 3-5 天]
    C --> D[审核: 0.5-1 天]
    D --> E[测试: 1-2 天]
    E --> F[部署: 0.5 天]

    G[总计: 6-11 天]

    style A fill:#e1f5e1
    style G fill:#f0e1ff
```

### **质量成本**

```yaml
预防成本（值得投入）:
  - 代码审核: +20% 时间
  - 单元测试: +30% 时间
  - 文档编写: +15% 时间
  总计: +65% 开发时间

修复成本（避免浪费）:
  - 生产 Bug 修复: -80% 时间
  - 回归问题: -60% 时间
  - 技术债务: -50% 时间

净效果: 质量提升 200%+，成本降低 40%
```

---

## 🛠️ 工具链整合

### **开发阶段**

```bash
# IDE / 编辑器
VS Code + ESLint + Prettier

# 版本控制
Git + GitHub Hooks

# 包管理
npm / yarn

# 开发服务器
Vite (HMR + 快速刷新)
```

### **质量保证**

```bash
# 代码审核
/review (自动检测安全问题)

# 代码简化
/simplify (重构建议)

# 测试
Vitest (单元测试)
/qa (端到端测试)
```

### **部署流水线**

```bash
# CI/CD
GitHub Actions / Vercel

# 监控
/canary (部署后监控)

# 文档
/document-release (自动更新文档)
```

---

## 📝 快速参考卡片

### **每日工作流**

```bash
# 1. 开始工作
git checkout -b feature/my-feature

# 2. 开发中
npm test          # 保持测试通过
npm run lint      # 检查代码规范

# 3. 提交前
git diff --stat   # 查看改动
# 如果 > 200 行，考虑简化

# 4. 提交
git add .
git commit -m "feat: 清晰的提交信息"

# 5. 审核和测试
npm test
/review           # 如涉及关键代码

# 6. 推送
git push origin feature/my-feature
```

### **代码质量检查清单**

```yaml
提交前:
  ✅ npm test 通过
  ✅ 代码改动 < 200 行
  ✅ 提交信息清晰

审核要点:
  ✅ 安全漏洞
  ✅ 性能问题
  ✅ 代码重复
  ✅ 命名规范

部署前:
  ✅ 所有测试通过
  ✅ 代码审查通过
  ✅ 文档已更新
  ✅ 监控已配置
```

---

## 🎓 学习路径

### **初级开发者**

```mermaid
graph LR
    A[基础知识] --> B[Git 工作流]
    B --> C[代码规范]
    C --> D[单元测试]
    D --> E[简单功能开发]

    style A fill:#e1f5e1
    style E fill:#f0e1ff
```

### **中级开发者**

```mermaid
graph LR
    A[代码质量] --> B[代码审核]
    B --> C[性能优化]
    C --> D[重构技巧]
    D --> E[复杂功能开发]

    style A fill:#e1f5e1
    style E fill:#f0e1ff
```

### **高级开发者**

```mermaid
graph LR
    A[架构设计] --> B[技术决策]
    B --> C[团队协作]
    C --> D[技术规划]
    D --> E[技术领导]

    style A fill:#e1f5e1
    style E fill:#f0e1ff
```

---

## 📚 相关资源

- [WORKFLOW.md](./WORKFLOW.md) - Git 工作流
- [CODE_QUALITY_WORKFLOW.md](./CODE_QUALITY_WORKFLOW.md) - 代码质量指南
- [TESTING_WORKFLOW.md](./TESTING_WORKFLOW.md) - 测试工作流
- [CLAUDE.md](./CLAUDE.md) - AI 辅助开发说明

---

**更新日志:**
- **2026-03-22**: 创建可视化工作流文档
- 包含 5 个主要阶段的流程图
- 提供 3 个关键决策点
- 整合工具链和最佳实践

**维护者**: PromptBox 开发团队
