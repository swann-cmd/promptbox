/**
 * 分类相关常量
 */

export const DEFAULT_CATEGORIES = [
  { name: "写作", slug: "writing" },
  { name: "视频", slug: "video" },
  { name: "产品", slug: "product" },
  { name: "数据", slug: "data" },
  { name: "学习", slug: "learning" },
  { name: "AI", slug: "ai" },
  { name: "创业", slug: "startup" },
  { name: "思维", slug: "thinking" },
  { name: "个人效率", slug: "productivity" },
  { name: "开发", slug: "development" },
];

export const CATEGORY_COLORS = {
  product: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-400 dark:bg-blue-500", accent: "#3b82f6" },
  writing: { bg: "bg-violet-50 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", dot: "bg-violet-400 dark:bg-violet-500", accent: "#7c3aed" },
  data: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-400 dark:bg-emerald-500", accent: "#059669" },
  learning: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-400 dark:bg-amber-500", accent: "#d97706" },
  ai: { bg: "bg-rose-50 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-400 dark:bg-rose-500", accent: "#e11d48" },
  startup: { bg: "bg-cyan-50 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400", dot: "bg-cyan-400 dark:bg-cyan-500", accent: "#0891b2" },
  thinking: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", dot: "bg-purple-400 dark:bg-purple-500", accent: "#9333ea" },
  productivity: { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", dot: "bg-green-400 dark:bg-green-500", accent: "#22c55e" },
  development: { bg: "bg-indigo-50 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", dot: "bg-indigo-400 dark:bg-indigo-500", accent: "#6366f1" },
  video: { bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-400 dark:bg-orange-500", accent: "#f97316" },
};

export const DEFAULT_CATEGORY_COLOR = { bg: "bg-gray-50 dark:bg-dark-bg", text: "text-gray-500 dark:text-dark-textSecondary", dot: "bg-gray-300 dark:bg-dark-textSecondary" };
