/**
 * 格式化工具函数
 * 使用 date-fns 进行日期格式化
 */

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期
 * @param {string|Date} date - 日期对象或日期字符串
 * @param {string} formatStr - 格式字符串，默认为 'yyyy-MM-dd'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, formatStr = 'yyyy-MM-dd') {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatStr, { locale: zhCN });
  } catch (error) {
    console.warn('日期格式化失败:', error);
    return '';
  }
}

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期对象或日期字符串
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(date) {
  return formatDate(date, 'yyyy年MM月dd日 HH:mm');
}

/**
 * 格式化相对时间
 * @param {string|Date} date - 日期对象或日期字符串
 * @returns {string} 相对时间字符串（如"刚刚"、"5分钟前"）
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';

    const distance = formatDistanceToNow(dateObj, {
      locale: zhCN,
      addSuffix: true
    });

    // 将英文的 "less than a minute ago" 转换为 "刚刚"
    if (distance.includes('不到1分钟')) {
      return '刚刚';
    }

    // 清理格式，去掉 "大约" 等词
    return distance
      .replace('大约', '')
      .replace('左右', '');
  } catch (error) {
    console.warn('相对时间格式化失败:', error);
    return '';
  }
}

/**
 * 格式化数字（添加千位分隔符）
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(num) {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('zh-CN');
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的文件大小字符串
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
