import { FireIcon, ClockIcon } from "../ui/icons";

/**
 * Tab 配置
 */
const TABS = [
  { value: "latest", label: "最新发布", icon: ClockIcon, activeColor: "blue" },
  { value: "popular", label: "热门排行榜", icon: FireIcon, activeColor: "orange" },
];

/**
 * 获取 Tab 按钮样式
 */
function getTabClasses(isActive, activeColor) {
  const activeClasses = {
    blue: "bg-blue-500 dark:bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none",
    orange: "bg-orange-500 dark:bg-orange-600 text-white shadow-sm shadow-orange-200 dark:shadow-none",
  };

  const inactiveClasses =
    "bg-white dark:bg-dark-bgSecondary text-gray-500 dark:text-dark-textSecondary hover:text-gray-700 dark:hover:text-dark-text border border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-gray-600";

  return `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
    isActive ? activeClasses[activeColor] : inactiveClasses
  }`;
}

/**
 * 社区 Tab 切换组件
 */
function CommunityTabs({ activeTab, onChange }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={getTabClasses(activeTab === tab.value, tab.activeColor)}
          >
            <Icon />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default CommunityTabs;
