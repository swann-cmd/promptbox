# 代码质量工作流指南

> **基于 PromptBox 项目实践经验总结**
>
> 本指南定义了何时进行代码审核、何时进行代码简化，以及如何将两者融入日常开发流程。

---

## 📋 目录

- [什么时候需要代码审核](#什么时候需要代码审核)
- [什么时候需要代码简化](#什么时候需要代码简化)
- [代码质量检查清单](#代码质量检查清单)
- [日常开发工作流](#日常开发工作流)
- [工具和自动化](#工具和自动化)

---

## 🔍 什么时候需要代码审核

### 1. **高风险代码变更**（必须审核）

```javascript
// 涉及安全、数据完整性的代码
✅ 数据库操作（SQL、RLS 策略）
✅ 支付和认证逻辑
✅ 权限控制
✅ 外部 API 调用
✅ 用户输入处理
```

**实际案例 - PromptBox 项目：**

```javascript
// ❌ 发现的问题：XSS 漏洞风险
export function validateTag(tag) {
  // 黑名单方法（不安全）
  if (/[<>"]/.test(tag)) return false;
  return /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(tag);
}

// ✅ 修复后：白名单方法
export function validateTag(tag) {
  // 检查 HTML 实体编码
  const hasEntities = /&(?:#\d+|#x[\da-fA-F]+|[a-zA-Z]+);/.test(tag);
  if (hasEntities) return false;
  // 白名单验证
  return /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/.test(tag);
}
```

### 2. **关键业务逻辑**（必须审核）

```javascript
// 需要审核的代码特征：
✅ 影响用户数据
✅ 涉及状态管理
✅ 复杂的算法
✅ 多步骤的工作流
✅ 并发操作
```

**实际案例 - 竞态条件：**

```javascript
// ❌ 发现的问题：读取过时状态
const updatePrompt = async (id, form) => {
  // 从闭包读取过时的 prompts 状态
  const previousPrompt = prompts.find(p => p.id === id);
  // 可能丢失发布状态
};

// ✅ 修复后：直接查询数据库
const updatePrompt = async (id, form) => {
  const { data: communityData } = await supabase
    .from("community_prompts")
    .select("id, status")
    .eq("prompt_id", id)
    .eq("status", "published")
    .single();
  // 准确获取发布状态
};
```

### 3. **代码量超过阈值**（建议审核）

```javascript
// 经验法则：
❌ 单个组件 > 300 行 → 需要重构
❌ 单个函数 > 50 行 → 需要拆分
❌ 嵌套层级 > 3 层 → 需要简化
❌ 参数 > 5 个 → 需要封装对象
```

**PromptBox 实际数据：**

```javascript
// 重构前：App.jsx 791 行
function App() {
  // 31 个 React hooks
  // 45+ 个状态变量
  // 混合了太多关注点
}

// 重构后：App.jsx 467 行（-41%）
// 提取了：
// - usePromptData hook
// - useCategoryData hook
// - useModalStates hook
// - AppHeader 组件
// - CategoryTabs 组件
// - PromptGrid 组件
```

---

## 🔧 什么时候需要代码简化

### 1. **明显的代码异味**

```javascript
// ❌ 重复代码
fetchUserPrompts();
fetchCommunityPrompts();
fetchFavoritePrompts();

// ✅ 简化后
fetchAllPrompts(['user', 'community', 'favorite']);
```

### 2. **性能问题**

```javascript
// ❌ 未优化的循环（O(n*m) 复杂度）
prompts.forEach(p => {
  categories.forEach(c => {
    if (p.categoryId === c.id) {
      // 处理逻辑
    }
  });
});

// ✅ 优化后（O(n+m) 复杂度）
const categoryMap = new Map(categories.map(c => [c.id, c]));
prompts.forEach(p => {
  const category = categoryMap.get(p.categoryId);
  if (category) {
    // 处理逻辑
  }
});
```

**PromptBox 实际优化：**

```javascript
// ❌ 重复的 toLowerCase 调用
const filtered = prompts.filter(p => {
  return p.title.toLowerCase().includes(query) ||
         p.description.toLowerCase().includes(query) ||
         p.content.toLowerCase().includes(query);
});

// ✅ 优化后：只调用一次
const query = searchQuery.toLowerCase();
const filtered = prompts.filter(p => {
  const titleMatch = p.title.toLowerCase().includes(query);
  if (titleMatch) return true;
  // ... 其他检查
});
```

### 3. **技术债务累积**

```javascript
// 需要还债的信号：
⚠️ TODO 注释超过 10 个
⚠️ 重复的 utility 函数
⚠️ 过时的依赖包
⚠️ 不一致的命名规范
⚠️ 缺少测试覆盖
```

### 4. **团队协作需求**

```javascript
// 需要简化的场景：
🐌 新人上手困难
🐌 功能开发缓慢
🐌 Bug 修复频繁引入新问题
🐌 代码审查耗时过长
🐌 频繁的 merge 冲突
```

---

## ✅ 代码质量检查清单

### **提交前检查**

```bash
# 1. 运行测试
npm test

# 2. 检查代码量
git diff --stat

# 3. 查看具体改动
git diff

# 4. 如果改动 > 200 行，考虑先简化
```

### **代码审核检查点**

```javascript
// 安全性
✅ XSS 防护（输入验证、输出转义）
✅ SQL 注入防护（参数化查询）
✅ 权限检查（RLS 策略）
✅ 敏感数据保护

// 性能
✅ 避免不必要的重渲染
✅ 使用 useMemo/useCallback 优化
✅ 避免深层嵌套循环
✅ 使用 Map/Set 优化查找

// 可维护性
✅ 函数单一职责
✅ 命名清晰明确
✅ 适当的注释
✅ 一致的代码风格
```

---

## 🚀 日常开发工作流

### **阶段 1：功能开发**

```javascript
1. 编写代码
2. 本地自测
3. 运行测试套件
4. 提交前检查：git diff

⚠️ 如果改动 > 200 行 → 先简化，再提交
```

### **阶段 2：提交前审核**

```javascript
// 使用 /review 技能
/review

自动检测：
✅ SQL 安全问题
✅ 竞态条件
✅ LLM 信任边界
✅ 枚举值完整性
✅ 条件副作用
✅ 代码一致性问题
```

**实际案例 - PromptBox 审核发现：**

```
审核发现了 6 个关键问题：
1. XSS 漏洞（标签验证）
2. 竞态条件（updatePrompt）
3. 竞态条件（incrementUsage）
4. 枚举值不完整
5. 魔术数字
6. 重复逻辑

全部修复后：
- 代码安全性提升
- 测试覆盖率从 19 → 47 (+147%)
```

### **阶段 3：定期重构**

```javascript
// 每隔 2-4 周
1. 运行代码复杂度分析
2. 识别最复杂的模块
3. 制定简化计划
4. 增量重构，保持测试通过
```

**PromptBox 重构计划：**

```
7 个阶段，10 天完成

Phase 1: 安装标准库
Phase 2: 提取 API 工具
Phase 3: 替换自定义实现
Phase 4-6: 提取自定义 Hooks
Phase 7: 更新导入和清理

结果：
- 代码减少 25% (~600 行)
- 测试增加 147% (+28 个测试)
- 开发效率显著提升
```

---

## 🛠️ 工具和自动化

### **代码审核工具**

```javascript
// 1. /review - 自动代码审核
/review
→ 检测 SQL 安全、竞态条件、LLLM 信任边界等

// 2. ESLint - 代码规范
npm run lint
→ 检测代码风格问题

// 3. Vitest - 测试覆盖
npm test -- --coverage
→ 确保测试覆盖率 > 80%
```

### **代码简化工具**

```javascript
// 1. /simplify - 代码简化建议
/simplify
→ 分析代码复杂度，提供重构建议

// 2. Bundle 分析
npm run build
→ 检查打包体积，识别大文件

// 3. 性能分析
npm run dev -- --profile
→ 分析组件渲染性能
```

### **工作流脚本**

```bash
# .git/hooks/pre-commit
#!/bin/bash
# 提交前自动运行测试
npm test || exit 1

# 检查代码量
CHANGES=$(git diff --cached --stat | tail -1 | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+')
if [ "$CHANGES" -gt 200 ]; then
  echo "⚠️  改动超过 200 行，请考虑先简化代码"
  exit 1
fi
```

---

## 📊 PromptBox 经验总结

### **今天通过审核发现的问题：**

```javascript
// 1. 安全问题
validateTag 使用黑名单 → 改为白名单

// 2. 并发问题
读取过时的 prompts 状态 → 直接查询数据库

// 3. 代码组织
App.jsx 过于庞大 → 拆分为自定义 hooks
```

### **简化效果量化：**

```javascript
代码量：
- App.jsx: 791 → 467 行 (-41%)
- 总代码: ~600 行减少 (-25%)

测试覆盖率：
- 19 → 47 个测试 (+147%)
- 覆盖率: 基础覆盖 → 关键路径全覆盖

开发效率：
- 添加新功能更快
- Bug 修复更容易
- 代码审查更快速
```

---

## ⚖️ 如何平衡

### **不要过度简化**

```javascript
// ❌ 过早优化
function add(a, b) {
  return (a + b) * 1.0; // 不必要的复杂化
}

// ✅ 适度简化
function add(a, b) {
  return a + b;
}
```

### **不要跳过审核**

```javascript
// ❌ 危险的做法
"这只是小改动，不用审核"

// ✅ 安全的做法
"即使是小改动，也要快速审查关键部分"
```

---

## 🎯 实用建议

### **每日工作流**

```javascript
1. 功能开发 → 自测
2. 改动 > 100 行 → 考虑简化
3. 涉及数据/安全 → 必须审核
4. 提交前 → 运行 npm test
5. 定期 → 回顾和重构
```

### **团队协作建议**

```javascript
// Code Review 准则
- 保持评论建设性
- 提供具体改进建议
- 解释为什么这样改
- 尊重原作者意图

// 重构时机
- 新功能开发之前
- Bug 修复之后
- 定期技术债务还债
- 代码审查发现问题
```

---

## 📚 相关资源

- [WORKFLOW.md](./WORKFLOW.md) - Git 分支工作流
- [TESTING_WORKFLOW.md](./TESTING_WORKFLOW.md) - 测试工作流
- [CODE_FIXES_SUMMARY.md](./CODE_FIXES_SUMMARY.md) - 代码修复总结
- [PromptBox 代码简化计划](./.claude/plans/) - 详细的简化计划

---

## 📝 更新日志

- **2026-03-22**: 基于代码简化实践创建文档
- 包含 6 个实际案例和量化效果
- 提供完整的检查清单和工作流

---

**总结：代码审核确保安全性，代码简化提升可维护性。两者结合，才能构建长期健康的项目。**
