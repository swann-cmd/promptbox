import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

const PromptForm = ({ isOpen, onClose, prompt, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!prompt;

  useEffect(() => {
    if (isOpen) {
      if (prompt) {
        setTitle(prompt.title || '');
        setContent(prompt.content || '');
        setTags(prompt.tags ? prompt.tags.join(', ') : '');
      } else {
        setTitle('');
        setContent('');
        setTags('');
      }
      setError('');
    }
  }, [isOpen, prompt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('未登录');

      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const promptData = {
        user_id: user.id,
        title,
        content,
        tags: tagsArray,
      };

      let result;
      if (isEdit) {
        result = await supabase
          .from('prompts')
          .update(promptData)
          .eq('id', prompt.id);
      } else {
        result = await supabase
          .from('prompts')
          .insert([{ ...promptData, created_at: new Date().toISOString() }]);
      }

      if (result.error) throw result.error;

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      setError(error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '编辑 Prompt' : '新增 Prompt'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <Input
          label="标题"
          placeholder="输入 prompt 标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="内容"
          placeholder="输入 prompt 内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          required
        />

        <Input
          label="标签（用逗号分隔）"
          placeholder="例如：写作, 编程, 创意"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PromptForm;
