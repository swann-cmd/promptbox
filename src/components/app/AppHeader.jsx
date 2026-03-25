/**
 * AppHeader Component
 * 应用头部导航栏
 * 从 App.jsx 提取出来的头部组件
 */

import PropTypes from 'prop-types';
import { LogoIcon, PlusIcon, UploadIcon, DownloadIcon, CommunityIcon } from '../ui/icons';
import ThemeToggleButton from './ThemeToggleButton';

export function AppHeader({
  user,
  userProfile,
  onAdd,
  onImport,
  onExport,
  onCommunity,
  onLogout,
  onShowProfile
}) {
  const userInitial = userProfile?.display_name?.[0]?.toUpperCase() ||
    user?.name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const displayName = userProfile?.display_name || user?.name || user?.email;

  return (
    <div className="bg-white/80 dark:bg-dark-bgSecondary/80 backdrop-blur-xl border-b border-gray-100 dark:border-dark-border sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
            <LogoIcon />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-semibold text-gray-900 dark:text-dark-text">PromptBox</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Add Button */}
          <button
            onClick={onAdd}
            className="flex items-center justify-center p-2 sm:gap-1.5 sm:px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200"
            title="新增"
          >
            <PlusIcon />
            <span className="hidden sm:inline">新增</span>
          </button>

          {/* Import Button */}
          <button
            onClick={onImport}
            className="flex items-center justify-center p-2 sm:gap-1.5 sm:px-3.5 py-2 bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-dark-text text-xs font-semibold rounded-xl border border-gray-200 dark:border-dark-border transition-colors hidden sm:flex"
            title="导入"
          >
            <UploadIcon />
            <span className="hidden sm:inline">导入</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center justify-center p-2 sm:gap-1.5 sm:px-3.5 py-2 bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-dark-text text-xs font-semibold rounded-xl border border-gray-200 dark:border-dark-border transition-colors hidden sm:flex"
            title="导出"
          >
            <DownloadIcon />
            <span className="hidden sm:inline">导出</span>
          </button>

          {/* Community Button */}
          <button
            onClick={onCommunity}
            className="flex items-center justify-center p-2 sm:gap-1.5 sm:px-3.5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-purple-200"
            title="社区广场"
          >
            <CommunityIcon />
            <span className="hidden sm:inline">社区</span>
          </button>

          {/* User Section */}
          <div className="flex items-center gap-1 pl-1 sm:pl-3 sm:gap-2 border-l border-gray-100 dark:border-dark-border">
            {/* Theme Toggle Button */}
            <ThemeToggleButton className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-dark-bgSecondary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" />

            {/* Profile Button */}
            <button
              onClick={onShowProfile}
              className="flex items-center gap-1 sm:gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-full pr-1.5 sm:pr-2 pl-1 py-0.5 -ml-1 transition-colors"
              title="编辑个人资料"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-7 rounded-full bg-blue-100 flex items-center justify-center aspect-square">
                <span className="text-xs font-semibold text-blue-600">
                  {userInitial}
                </span>
              </div>
              <span className="text-xs text-gray-600 dark:text-dark-text font-medium hidden lg:block">
                {displayName}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="text-xs text-gray-400 dark:text-dark-textSecondary hover:text-gray-600 dark:hover:text-dark-text transition-colors hidden sm:block"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

AppHeader.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    email: PropTypes.string.isRequired,
  }),
  userProfile: PropTypes.shape({
    display_name: PropTypes.string,
    avatar_url: PropTypes.string,
  }),
  onAdd: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onCommunity: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onShowProfile: PropTypes.func.isRequired,
};
