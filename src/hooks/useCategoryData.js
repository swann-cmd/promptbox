/**
 * useCategoryData Hook
 * 管理分类数据的获取、去重、排序和默认分类创建
 * 从 App.jsx 提取出来的分类管理逻辑
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_CATEGORIES } from '../constants/categories';

/**
 * 去重分类数据（根据 slug）
 * @param {Array} data - 原始分类数据
 * @returns {Array} 去重后的分类数据
 */
function deduplicateCategories(data) {
  const uniqueCategories = [];
  const seenSlugs = new Set();

  if (!data) return uniqueCategories;

  // 从后往前遍历，保留最新的记录
  for (let i = data.length - 1; i >= 0; i--) {
    const cat = data[i];
    if (!seenSlugs.has(cat.slug)) {
      seenSlugs.add(cat.slug);
      uniqueCategories.unshift(cat);
    }
  }

  return uniqueCategories;
}

/**
 * 确保所有默认分类都存在
 * @param {Array} existingCategories - 现有分类
 * @param {string} userId - 用户 ID
 * @returns {Array} 缺失的默认分类
 */
function findMissingDefaultCategories(existingCategories) {
  const existingSlugs = new Set(existingCategories.map(cat => cat.slug));
  return DEFAULT_CATEGORIES.filter(
    defaultCat => !existingSlugs.has(defaultCat.slug)
  );
}

/**
 * 按照默认分类顺序排序
 * @param {Array} categories - 分类数组
 * @returns {Array} 排序后的分类数组
 */
function orderByDefaultCategories(categories) {
  // 按照 DEFAULT_CATEGORIES 的顺序排序
  const orderedCategories = DEFAULT_CATEGORIES
    .map(defaultCat =>
      categories.find(cat => cat.slug === defaultCat.slug)
    )
    .filter(Boolean); // 过滤掉 undefined

  // 添加自定义分类（不在默认分类中的）
  const customCategories = categories.filter(
    cat => !DEFAULT_CATEGORIES.find(defaultCat => defaultCat.slug === cat.slug)
  );

  return [...orderedCategories, ...customCategories];
}

/**
 * 自定义 Hook: 管理分类数据
 * @param {string} userId - 用户 ID
 * @returns {Object} 分类数据状态和操作函数
 */
export function useCategoryData(userId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * 获取分类列表
   */
  const fetchCategories = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // 获取用户的分类
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // 去重
      const uniqueCategories = deduplicateCategories(data);

      // 如果没有分类，自动创建默认分类
      if (!uniqueCategories || uniqueCategories.length === 0) {
        console.log("检测到用户没有分类，正在创建默认分类...");
        const newCategories = DEFAULT_CATEGORIES.map(cat => ({
          user_id: userId,
          name: cat.name,
          slug: cat.slug
        }));

        const { data: newData, error: insertError } = await supabase
          .from("categories")
          .insert(newCategories)
          .select();

        if (insertError) {
          console.error("创建默认分类失败:", insertError);
          setCategories([]);
        } else {
          console.log("默认分类创建成功:", newData);
          setCategories(newData || []);
        }
      } else {
        // 检查是否有新增的默认分类，自动补充
        const missingCategories = findMissingDefaultCategories(uniqueCategories);

        if (missingCategories.length > 0) {
          console.log("检测到新增的分类，正在补充:", missingCategories.map(c => c.name));
          const newCategories = missingCategories.map(cat => ({
            user_id: userId,
            name: cat.name,
            slug: cat.slug
          }));

          const { data: newData, error: insertError } = await supabase
            .from("categories")
            .insert(newCategories)
            .select();

          if (!insertError && newData) {
            console.log("新分类补充成功:", newData);
            // 合并新旧分类
            const allCategories = [...newData, ...uniqueCategories];
            // 按照默认分类的顺序排序
            const orderedCategories = orderByDefaultCategories(allCategories);
            setCategories(orderedCategories);
          } else {
            console.warn("补充新分类失败，使用现有分类:", insertError);
            setCategories(uniqueCategories);
          }
        } else {
          // 使用去重后的分类数据
          const orderedCategories = orderByDefaultCategories(uniqueCategories);
          setCategories(orderedCategories);
        }
      }
    } catch (err) {
      console.error("加载分类失败:", err);
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 根据 slug 获取分类
   */
  const getCategoryByName = useCallback((slug) => {
    return categories.find(cat => cat.slug === slug);
  }, [categories]);

  /**
   * 根据 ID 获取分类
   */
  const getCategoryById = useCallback((id) => {
    return categories.find(cat => cat.id === id);
  }, [categories]);

  // 初始加载
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    // 状态
    categories,
    loading,
    error,

    // 操作
    fetchCategories,
    getCategoryByName,
    getCategoryById,
  };
}
