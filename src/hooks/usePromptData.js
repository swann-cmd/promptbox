/**
 * usePromptData Hook
 * 管理提示词数据的获取、添加、更新、删除和使用计数
 * 从 App.jsx 提取出来的提示词 CRUD 逻辑
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatPromptData, createCommunityPromptMap } from '../utils/formatters/promptFormatter';
import { validatePrompt, sanitizeInput } from '../utils/sanitize';

/**
 * 自定义 Hook: 管理提示词数据
 * @param {string} userId - 用户 ID
 * @returns {Object} 提示词数据状态和操作函数
 */
export function usePromptData(userId) {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * 获取提示词列表
   */
  const fetchPrompts = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // 获取用户的提示词
      const { data, error } = await supabase
        .from("prompts")
        .select("*, categories(name, slug)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 查询已发布的社区提示词
      const { data: communityData, error: communityError } = await supabase
        .from("community_prompts")
        .select("id, prompt_id, status")
        .eq("user_id", userId)
        .eq("status", "published");

      // 创建映射：prompt_id -> community_prompt_id
      const communityPromptMap = createCommunityPromptMap(communityData);

      setPrompts(formatPromptData(data, communityPromptMap));
    } catch (err) {
      console.error("加载 prompts 失败:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 添加新提示词
   */
  const addPrompt = useCallback(async (form) => {
    if (!userId) {
      throw new Error("用户未登录");
    }

    try {
      // 验证输入
      validatePrompt(form.title, form.content);

      // 清理输入
      const sanitizedTitle = sanitizeInput(form.title, 200);
      const sanitizedContent = sanitizeInput(form.content, 10000);
      const sanitizedTags = (form.tags || [])
        .map(tag => sanitizeInput(tag.trim(), 50))
        .filter(tag => tag.length > 0)
        .slice(0, 10);

      // 插入数据库
      const { error } = await supabase
        .from("prompts")
        .insert({
          user_id: userId,
          title: sanitizedTitle,
          content: sanitizedContent,
          category_id: form.categoryId,
          model: form.model,
          tags: sanitizedTags.length > 0 ? sanitizedTags : null,
          usage_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      // 重新获取列表
      await fetchPrompts();

      return { success: true };
    } catch (err) {
      console.error("添加失败:", err);
      throw err;
    }
  }, [userId, fetchPrompts]);

  /**
   * 更新提示词
   */
  const updatePrompt = useCallback(async (id, form) => {
    if (!userId) {
      throw new Error("用户未登录");
    }

    try {
      // 验证输入
      validatePrompt(form.title, form.content);

      // 清理输入
      const sanitizedTitle = sanitizeInput(form.title, 200);
      const sanitizedContent = sanitizeInput(form.content, 10000);
      const sanitizedTags = (form.tags || [])
        .map(tag => sanitizeInput(tag.trim(), 50))
        .filter(tag => tag.length > 0)
        .slice(0, 10);

      // 查询社区发布状态（避免竞态条件）
      const { data: communityData } = await supabase
        .from("community_prompts")
        .select("id, status")
        .eq("prompt_id", id)
        .eq("status", "published")
        .single();

      const isPublishedToCommunity = !!communityData;

      // 更新数据库
      const { data, error } = await supabase
        .from("prompts")
        .update({
          title: sanitizedTitle,
          content: sanitizedContent,
          category_id: form.categoryId,
          model: form.model,
          tags: sanitizedTags.length > 0 ? sanitizedTags : null,
        })
        .eq("id", id)
        .select(`
          *,
          categories(name, slug)
        `)
        .single();

      if (error) throw error;

      const updatedPrompt = {
        id: data.id,
        title: data.title,
        content: data.content,
        categoryId: data.category_id,
        categoryName: data.categories?.name,
        categorySlug: data.categories?.slug,
        model: data.model,
        tags: data.tags || [],
        usageCount: data.usage_count,
        createdAt: data.created_at,
        isPublishedToCommunity
      };

      // 保存旧状态以便错误时回滚
      let previousPrompt = null;
      setPrompts(prev => {
        previousPrompt = prev.find(p => p.id === id);
        return prev; // 只读取，不修改
      });

      // 乐观更新本地状态
      setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p));

      return { success: true, prompt: updatedPrompt };
    } catch (err) {
      console.error("更新失败:", err);
      // 回滚乐观更新
      if (previousPrompt) {
        setPrompts(prev => prev.map(p => p.id === id ? previousPrompt : p));
      }
      throw err;
    }
  }, [userId]);

  /**
   * 删除提示词
   */
  const deletePrompt = useCallback(async (id) => {
    if (!userId) {
      throw new Error("用户未登录");
    }

    try {
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // 乐观更新本地状态
      setPrompts(prev => prev.filter(p => p.id !== id));

      return { success: true };
    } catch (err) {
      console.error("删除失败:", err);
      throw err;
    }
  }, [userId]);

  /**
   * 增加使用计数（复制时调用）
   */
  const incrementUsage = useCallback(async (id) => {
    // 先获取当前计数（避免闭包陷阱）
    let currentCount = 0;
    setPrompts(prev => {
      const prompt = prev.find(p => p.id === id);
      currentCount = prompt ? prompt.usageCount : 0;
      return prev; // 不修改状态，只读取
    });

    const newCount = currentCount + 1;

    try {
      // 尝试调用 RPC 函数
      const { error } = await supabase.rpc("increment_usage_count", { prompt_id: id });

      // 如果 RPC 函数不存在，降级到本地更新
      if (error) {
        console.warn("RPC 调用失败，使用本地计数:", error.message);
      }

      // 乐观更新本地状态
      setPrompts(prev => prev.map(p =>
        p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
      ));

      return { success: true, usageCount: newCount };
    } catch (err) {
      console.error("更新使用计数失败:", err);
      // 即使失败也不影响用户复制操作，静默处理
      return { success: true, usageCount: currentCount };
    }
  }, []);

  // 初始加载
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    // 状态
    prompts,
    loading,
    error,

    // 操作
    fetchPrompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    incrementUsage,
  };
}
