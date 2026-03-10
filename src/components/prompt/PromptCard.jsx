import React from 'react';

const PromptCard = ({ prompt, onClick, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer">
      <div onClick={() => onClick && onClick(prompt)}>
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
          {prompt.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {prompt.content}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {prompt.tags && prompt.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs text-gray-400">
            {new Date(prompt.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(prompt);
          }}
          className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        >
          编辑
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(prompt);
          }}
          className="flex-1 px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
        >
          删除
        </button>
      </div>
    </div>
  );
};

export default PromptCard;
