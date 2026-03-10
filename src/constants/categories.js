/**
 * 分类相关常量
 */

export const DEFAULT_CATEGORIES = [
  { name: "产品", slug: "product" },
  { name: "写作", slug: "writing" },
  { name: "数据", slug: "data" },
  { name: "学习", slug: "learning" },
  { name: "AI", slug: "ai" },
  { name: "创业", slug: "startup" },
  { name: "思维", slug: "thinking" },
  { name: "个人效率", slug: "productivity" },
  { name: "开发", slug: "development" },
  { name: "视频", slug: "video" },
];

export const CATEGORY_COLORS = {
  product: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400", accent: "#3b82f6" },
  writing: { bg: "bg-violet-50", text: "text-violet-600", dot: "bg-violet-400", accent: "#7c3aed" },
  data: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400", accent: "#059669" },
  learning: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400", accent: "#d97706" },
  ai: { bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-400", accent: "#e11d48" },
  startup: { bg: "bg-cyan-50", text: "text-cyan-600", dot: "bg-cyan-400", accent: "#0891b2" },
  thinking: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-400", accent: "#9333ea" },
  productivity: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-400", accent: "#22c55e" },
  development: { bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-400", accent: "#6366f1" },
  video: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400", accent: "#f97316" },
};

export const DEFAULT_CATEGORY_COLOR = { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-300" };
