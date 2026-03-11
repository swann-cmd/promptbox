/**
 * Prompt 模板库
 * 提供预设的高质量 Prompt 模板，用户可以一键应用
 */

export const PROMPT_TEMPLATES = [
  // 产品类
  {
    id: "prd",
    title: "产品需求文档 PRD",
    category: "product",
    categoryName: "产品",
    content: `# 产品需求文档

## 1. 产品概述
请详细描述产品的核心功能和价值主张。

## 2. 目标用户
- 用户画像：
- 使用场景：
- 痛点分析：

## 3. 功能需求
列出产品的核心功能和非核心功能。

## 4. 竞品分析
对比市场上类似产品的优缺点。

## 5. 成功指标
如何衡量产品的成功？`,
    model: "通用",
    tags: ["产品", "需求文档", "PRD"]
  },
  {
    id: "user-research",
    title: "用户调研访谈提纲",
    category: "product",
    categoryName: "产品",
    content: `# 用户调研访谈

## 基本信息
- 访谈日期：
- 访谈对象：
- 访谈时长：

## 访谈问题

### 背景了解
1. 能否简单介绍一下自己？
2. 您目前的职业和行业是什么？

### 使用习惯
3. 您目前是如何解决[具体问题]的？
4. 在使用过程中遇到的最大困难是什么？
5. 您期望的理想解决方案是什么样的？

### 深度挖掘
6. 为什么这个问题对您很重要？
7. 如果这个问题得到解决，会对您产生什么影响？
8. 您愿意为解决这个问题付出多大的代价（时间/金钱）？

## 总结与洞察`,
    model: "通用",
    tags: ["产品", "用户调研", "访谈"]
  },

  // 写作类
  {
    id: "article-polish",
    title: "文章润色优化",
    category: "writing",
    categoryName: "写作",
    content: `# 文章润色助手

请帮我优化以下文章，要求：

1. 保持原意不变
2. 提升表达的准确性和流畅度
3. 优化句子结构，使其更加清晰
4. 修正语法错误和标点符号
5. 改善段落之间的逻辑衔接
6. 适当使用更精准的词汇

注意事项：
- 保持原文的语气和风格
- 不要添加原文没有的信息
- 对于专业性内容，保持准确性

请开始润色：`,
    model: "通用",
    tags: ["写作", "润色", "优化"]
  },
  {
    id: "email-writing",
    title: "商务邮件写作",
    category: "writing",
    categoryName: "写作",
    content: `# 商务邮件写作助手

请帮我撰写一封商务邮件，包含以下要素：

**邮件目的**：
- 收件人：
- 邮件主题：
- 核心信息：
- 期望结果：

要求：
1. 语气专业且友好
2. 结构清晰，重点突出
3. 行动号召明确
4. 长度适中，避免冗长

邮件格式建议：
- 开头：礼貌问候
- 正文：说明背景 + 提出请求/建议
- 结尾：明确的下一步行动
- 落款：专业签名`,
    model: "通用",
    tags: ["写作", "邮件", "商务"]
  },

  // 数据类
  {
    id: "data-analysis",
    title: "数据分析报告",
    category: "data",
    categoryName: "数据",
    content: `# 数据分析报告助手

作为专业数据分析师，请帮我完成以下分析：

## 数据概览
- 数据来源：
- 数据时间范围：
- 数据规模：

## 分析要求

### 1. 描述性统计
- 计算关键指标的平均值、中位数、标准差
- 识别数据的分布特征
- 发现异常值和趋势

### 2. 可视化建议
- 推荐合适的图表类型
- 说明图表设计的理由
- 标注需要注意的数据点

### 3. 洞察发现
- 总结 3-5 个关键发现
- 提供数据支撑
- 给出可行性建议

### 4. 局限性说明
- 指出分析的局限性
- 建议补充的数据
- 后续研究方向`,
    model: "通用",
    tags: ["数据", "分析", "报告"]
  },
  {
    id: "sql-query",
    title: "SQL 查询优化",
    category: "data",
    categoryName: "数据",
    content: `# SQL 查询优化助手

请帮我分析并优化以下 SQL 查询：

## 当前查询
\`\`\`sql
[在此粘贴您的 SQL 查询]
\`\`\`

## 优化目标
- 提高查询性能
- 改善代码可读性
- 确保结果准确性

## 分析要点

1. **执行计划分析**
   - 是否有全表扫描？
   - 索引使用是否合理？
   - 连接顺序是否优化？

2. **代码质量**
   - 是否符合 SQL 规范？
   - 是否有冗余逻辑？
   - 命名是否清晰？

3. **优化建议**
   - 添加/调整索引
   - 重写查询逻辑
   - 分区或分表建议

4. **替代方案**
   - 提供等价的优化查询
   - 对比性能差异
   - 说明权衡取舍`,
    model: "通用",
    tags: ["数据", "SQL", "优化"]
  },

  // 学习类
  {
    id: "learning-plan",
    title: "个性化学习计划",
    category: "learning",
    categoryName: "学习",
    content: `# 个性化学习计划

## 学习者信息
- 学习主题：
- 当前水平：
- 可用时间：
- 学习目标：

## 学习计划制定

### 第一阶段：基础建立（1-2周）
- 学习目标：
- 学习资源：
- 练习任务：
- 检验标准：

### 第二阶段：技能提升（3-4周）
- 学习目标：
- 学习资源：
- 实践项目：
- 进度检查：

### 第三阶段：深化应用（5-8周）
- 学习目标：
- 学习资源：
- 综合项目：
- 能力评估：

## 学习建议
1. 每天投入时间：
2. 重点难点：
3. 学习方法：
4. 注意事项：

## 进度跟踪
- 每周回顾：
- 月度评估：
- 调整机制：`,
    model: "通用",
    tags: ["学习", "计划", "提升"]
  },
  {
    id: "concept-explain",
    title: "概念解释教学",
    category: "learning",
    categoryName: "学习",
    content: `# 概念解释教学助手

请用通俗易懂的方式解释以下概念：

## 概念
[在此输入需要解释的概念]

## 教学要求

1. **目标受众**
   - 年龄段：
   - 背景知识：
   - 学习目的：

2. **解释策略**
   - 使用类比和比喻
   - 结合生活实例
   - 循序渐进展开
   - 避免专业术语堆砌

3. **内容结构**
   - 简单定义（一句话）
   - 详细解释（为什么重要）
   - 举例说明（具体例子）
   - 常见误区（避坑指南）
   - 延伸学习（相关概念）

4. **互动环节**
   - 提问思考
   - 自测题目
   - 实践建议

请用清晰、友好、鼓励的语气进行讲解。`,
    model: "通用",
    tags: ["学习", "教学", "解释"]
  },

  // AI类
  {
    id: "prompt-engineering",
    title: "AI 提示词工程",
    category: "ai",
    categoryName: "AI",
    content: `# AI 提示词工程最佳实践

## 任务目标
[描述您希望 AI 完成的任务]

## 提示词框架

### 1. 角色设定（Role）
你是一个[专业角色]，具有[相关经验和能力]。

### 2. 任务描述（Task）
你的任务是[具体任务描述]。

### 3. 背景信息（Context）
背景信息如下：
- [相关信息1]
- [详细信息2]

### 4. 输出要求（Output）
请按照以下格式输出：
- [格式要求1]
- [格式要求2]

### 5. 约束条件（Constraints）
- 注意事项：
- 限制条件：
- 质量标准：

### 6. 示例参考（Example）
参考示例：
[提供一个好的输入输出示例]

## 优化建议

### 迭代优化
- 第一版提示词：
- 优化方向：
- 最终版本：

### 测试验证
- 测试用例：
- 边界情况：
- 改进建议：`,
    model: "通用",
    tags: ["AI", "提示词", "工程"]
  },

  // 开发类
  {
    id: "code-review",
    title: "代码审查助手",
    category: "development",
    categoryName: "开发",
    content: `# 代码审查助手

请帮我审查以下代码，提供专业反馈：

## 代码内容
\`\`\`[language]
[在此粘贴代码]
\`\`\`

## 审查维度

### 1. 功能性
- 是否实现需求？
- 边界情况处理？
- 业务逻辑正确？

### 2. 代码质量
- 可读性：命名、注释、结构
- 可维护性：模块化、扩展性
- 性能：算法复杂度、资源使用

### 3. 安全性
- 输入验证
- 输出编码
- 权限控制
- 漏洞风险

### 4. 最佳实践
- 设计模式应用
- 语言特性使用
- 框架规范遵守
- 代码复用

### 5. 改进建议
- 优点总结
- 问题清单（按优先级）
- 重构建议
- 学习资源

## 输出格式
请提供：
1. 总体评分（1-10分）
2. 主要优点（3-5个）
3. 待改进点（按优先级排序）
4. 具体修改建议（带代码示例）
5. 学习资源推荐`,
    model: "通用",
    tags: ["开发", "代码审查", "优化"]
  },

  // 视频类
  {
    id: "video-script",
    title: "短视频脚本创作",
    category: "video",
    categoryName: "视频",
    content: `# 短视频脚本创作

## 视频基本信息
- 视频主题：
- 目标时长：[15秒/30秒/60秒]
- 目标平台：抖音/快手/B站/小红书
- 目标受众：

## 脚本结构

### 开头（0-3秒）
**目标**：抓住观众注意力
- 画面：[视觉描述]
- 文案/旁白：
- 音乐/音效：

### 主体（4-X秒）
**目标**：传递核心信息
- 场景1：
  - 画面：
  - 文案：
- 场景2：
  - 画面：
  - 文案：

### 结尾（最后2秒）
**目标**：引导互动
- 画面：[视觉描述]
- 文案/旁白：[CTA引导]
- 音乐/音效：

## 创作建议

### 爆点设计
- 情绪价值：
- 知识价值：
- 实用价值：

### 节奏把控
- 前置铺垫：
- 高潮设计：
- 留白运用：

### 互动引导
- 点赞引导：
- 评论引导：
- 关注引导：
- 分享引导：

## 优化建议
- 去掉冗余信息
- 强化视觉冲击
- 提升完播率
- 优化转化路径`,
    model: "通用",
    tags: ["视频", "脚本", "创作"]
  }
];

/**
 * 根据分类筛选模板
 */
export function getTemplatesByCategory(categorySlug) {
  if (categorySlug === "all") {
    return PROMPT_TEMPLATES;
  }
  return PROMPT_TEMPLATES.filter(t => t.category === categorySlug);
}

/**
 * 根据ID获取模板
 */
export function getTemplateById(id) {
  return PROMPT_TEMPLATES.find(t => t.id === id);
}

/**
 * 搜索模板
 */
export function searchTemplates(query) {
  if (!query) return PROMPT_TEMPLATES;

  const lowerQuery = query.toLowerCase();
  return PROMPT_TEMPLATES.filter(t =>
    t.title.toLowerCase().includes(lowerQuery) ||
    t.content.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 获取所有预定义的分类
 * 返回去重后的分类列表
 */
export function getTemplateCategories() {
  const categoryMap = new Map();

  PROMPT_TEMPLATES.forEach(template => {
    if (!categoryMap.has(template.category)) {
      categoryMap.set(template.category, {
        slug: template.category,
        name: template.categoryName
      });
    }
  });

  return Array.from(categoryMap.values());
}
