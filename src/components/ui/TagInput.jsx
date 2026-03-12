import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { MAX_TAGS } from '../../constants/app';

/**
 * 标签输入组件
 * 用于选择和管理标签，支持添加、删除标签
 */
export function TagInput({
  tags = [],
  onAddTag,
  onRemoveTag,
  inputPlaceholder = '输入标签',
  className = '',
}) {
  const [tagInput, setTagInput] = useState('');
  const inputRef = useRef(null);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < MAX_TAGS) {
      onAddTag(trimmed);
      setTagInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={className}>
      {/* 标签列表 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="w-4 h-4 rounded-md hover:bg-blue-200/50 flex items-center justify-center transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 输入框 */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          disabled={tags.length >= MAX_TAGS}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {tags.length}/{MAX_TAGS}
          </span>
          {tagInput && (
            <button
              type="button"
              onClick={handleAddTag}
              disabled={tags.length >= MAX_TAGS}
              className="px-2.5 py-1 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              添加
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

TagInput.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
  inputPlaceholder: PropTypes.string,
  className: PropTypes.string,
};
