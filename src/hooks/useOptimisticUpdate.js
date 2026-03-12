import { useState, useCallback } from "react";
import { MAX_RETRIES } from "../constants/app";

/**
 * 自定义 Hook：处理乐观更新和自动重试
 * @param {Function} apiCall - API 调用函数
 * @param {Function} onChange - 状态变化回调
 * @returns {Object} { state, loading, execute, retry }
 */
export function useOptimisticUpdate(apiCall, onChange) {
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (currentState, updateFn) => {
    if (loading) return { success: false, error: 'Operation in progress' };

    // 计算新状态（乐观更新）
    const newState = updateFn(currentState);
    const rollbackState = { ...currentState };

    setLoading(true);
    let attempts = 0;
    const maxAttempts = MAX_RETRIES + 1;

    while (attempts < maxAttempts) {
      try {
        const data = await apiCall();

        // 使用服务器返回的数据更新状态
        const finalState = {
          ...newState,
          isActive: data.isLiked ?? data.isFavorited ?? data.isActive ?? newState.isActive,
          count: data.likeCount ?? data.count ?? newState.count
        };

        // 通知父组件状态变化
        if (onChange) {
          if (data.isLiked !== undefined) {
            onChange({ isLiked: data.isLiked, likeCount: data.likeCount });
          } else if (data.isFavorited !== undefined) {
            onChange({ isFavorited: data.isFavorited });
          }
        }

        setRetryCount(0);
        setLoading(false);
        return { success: true, state: finalState };
      } catch (error) {
        attempts++;
        console.error(`操作失败 (尝试 ${attempts}/${maxAttempts}):`, error);

        if (attempts < maxAttempts) {
          // 指数退避重试
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
          continue;
        }

        // 所有尝试都失败
        console.error("操作失败，已回滚状态");
        setRetryCount(0);
        setLoading(false);
        return { success: false, error, state: rollbackState };
      }
    }
  }, [loading, apiCall, onChange]);

  return {
    loading,
    retryCount,
    execute,
  };
}

/**
 * 简化版：用于布尔切换的乐观更新
 * @param {Function} apiCall - API 调用函数
 * @param {Function} onChange - 状态变化回调
 * @returns {Object} { isActive, currentCount, loading, toggle }
 */
export function useToggleOptimistic(apiCall, initialState = false, initialCount = 0, onChange) {
  const [isActive, setIsActive] = useState(initialState);
  const [currentCount, setCurrentCount] = useState(initialCount);

  const { loading, execute } = useOptimisticUpdate(apiCall, onChange);

  const toggle = useCallback(async () => {
    const newActive = !isActive;
    const newCount = newActive ? currentCount + 1 : currentCount - 1;

    const result = await execute(
      { isActive, currentCount },
      () => ({ isActive: newActive, count: newCount })
    );

    if (result.success) {
      setIsActive(result.state.isActive);
      setCurrentCount(result.state.count);
    } else {
      // 回滚
      setIsActive(result.state.isActive);
      setCurrentCount(result.state.count);
    }
  }, [isActive, currentCount, execute]);

  return {
    isActive,
    currentCount,
    loading,
    toggle,
    setIsActive,
    setCurrentCount,
  };
}
