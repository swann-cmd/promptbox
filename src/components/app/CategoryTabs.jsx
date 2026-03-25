/**
 * CategoryTabs Component
 * 分类标签页
 * 从 App.jsx 提取出来的分类切换组件
 */

import PropTypes from 'prop-types';

export function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
  totalCount
}) {
  // 构建完整的分类列表（包含"全部"）
  const allCategories = [
    { id: "all", slug: "all", name: "全部", count: totalCount },
    ...categories.map(cat => ({
      ...cat,
      count: cat.count || 0
    }))
  ];

  return (
    <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
      {allCategories.map((cat) => {
        const isActive = (activeCategory === "all" && cat.slug === "all") || activeCategory === cat.slug;

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.slug === "all" ? "all" : cat.slug)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              isActive
                ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
                : "bg-white dark:bg-dark-bg text-gray-500 dark:text-dark-textSecondary hover:text-gray-700 dark:hover:text-dark-text border border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-gray-600"
            }`}
          >
            {cat.name}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              isActive
                ? "bg-blue-400/50 text-white"
                : "bg-gray-100 dark:bg-dark-bgSecondary text-gray-400 dark:text-dark-textSecondary"
            }`}>
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

CategoryTabs.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      slug: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      count: PropTypes.number,
    })
  ).isRequired,
  activeCategory: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
};
