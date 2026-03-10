import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const PromptDetail = ({ isOpen, onClose, prompt, onEdit }) => {
  if (!prompt) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      alert('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={prompt.title}>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">内容</h4>
          <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-800">
            {prompt.content}
          </div>
        </div>

        {prompt.tags && prompt.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">标签</h4>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-400">
          创建于 {new Date(prompt.created_at).toLocaleString()}
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={copyToClipboard}
            className="flex-1"
          >
            复制内容
          </Button>
          {onEdit && (
            <Button
              variant="secondary"
              onClick={() => onEdit(prompt)}
              className="flex-1"
            >
              编辑
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PromptDetail;
