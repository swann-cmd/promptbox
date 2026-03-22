/**
 * PromptGrid Component
 * 提示词网格展示
 * 从 App.jsx 提取出来的提示词列表组件
 */

import PropTypes from 'prop-types';
import { PromptCard } from '../prompts';
import { LoadingState, EmptyState as EmptyStateUI } from '../ui';
import { LoadingSpinner } from '../ui/icons';

const EmptyStateIcon = () => (
  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export function PromptGrid({
  prompts,
  loading,
  onCopy,
  onClick,
  onDelete,
  onClearFilter
}) {
  if (loading) {
    return (
      <LoadingState
        icon={<LoadingSpinner />}
        message="加载中..."
      />
    );
  }

  if (prompts.length === 0) {
    return (
      <EmptyStateUI
        icon={<EmptyStateIcon />}
        title="没有找到相关提示词"
        message="试试调整搜索词或选择其他分类"
        action={
          onClearFilter && (
            <button
              onClick={onClearFilter}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              清除筛选
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {prompts.map((p) => (
        <PromptCard
          key={p.id}
          prompt={p}
          onCopy={onCopy}
          onClick={onClick}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

PromptGrid.propTypes = {
  prompts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      usageCount: PropTypes.number,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onCopy: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClearFilter: PropTypes.func,
};
