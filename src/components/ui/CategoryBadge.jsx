import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "../../constants/categories.js";

/**
 * 分类标签组件
 */
function CategoryBadge({ categorySlug, categoryName }) {
  const colors = CATEGORY_COLORS[categorySlug] || DEFAULT_CATEGORY_COLOR;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {categoryName || categorySlug}
    </span>
  );
}

export default CategoryBadge;
