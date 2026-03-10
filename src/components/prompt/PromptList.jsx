import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import PromptCard from './PromptCard';
import Button from '../common/Button';
import Input from '../common/Input';

const PromptList = ({ onAddClick, onPromptClick, onEditClick }) => {
  const [prompts, setPrompts] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = prompts.filter(prompt =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (prompt.tags && prompt.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
      setFilteredPrompts(filtered);
    } else {
      setFilteredPrompts(prompts);
    }
  }, [searchTerm, prompts]);

  const fetchPrompts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('获取 prompts 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (prompt) => {
    if (!confirm('确定要删除这个 Prompt 吗？')) return;

    try {
      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', prompt.id);

      if (error) throw error;
      setPrompts(prompts.filter(p => p.id !== prompt.id));
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="搜索 prompts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button onClick={onAddClick}>
          + 新增 Prompt
        </Button>
      </div>

      {filteredPrompts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? '没有找到匹配的 Prompts' : '还没有 Prompts，点击上方按钮添加'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onClick={onPromptClick}
              onEdit={onEditClick}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptList;
