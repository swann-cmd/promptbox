import { FireIcon, ClockIcon } from "../ui/icons";

/**
 * 社区 Tab 切换组件
 */
function CommunityTabs({ activeTab, onChange }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <button
        onClick={() => onChange("latest")}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          activeTab === "latest"
            ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
            : "bg-white text-gray-500 hover:text-gray-700 border border-gray-100 hover:border-gray-200"
        }`}
      >
        <ClockIcon />
        最新发布
      </button>
      <button
        onClick={() => onChange("popular")}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          activeTab === "popular"
            ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
            : "bg-white text-gray-500 hover:text-gray-700 border border-gray-100 hover:border-gray-200"
        }`}
      >
        <FireIcon />
        热门排行榜
      </button>
    </div>
  );
}

export default CommunityTabs;
