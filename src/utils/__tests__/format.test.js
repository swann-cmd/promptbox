/**
 * Tests for format utilities
 */

import { describe, it, expect, vi } from 'vitest';
import { formatDate, formatDateTime, formatRelativeTime } from '../format';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = formatDate(date);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('should handle ISO string input', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('should handle custom format', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = formatDate(date, 'yyyy/MM/dd');
    expect(result).toBe('2024/01/15');
  });

  it('should return empty string for null input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(formatDate('invalid date')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('should format datetime correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = formatDateTime(date);
    expect(result).toMatch(/\d{4}年\d{2}月\d{2}日 \d{2}:\d{2}/);
  });

  it('should return empty string for null input', () => {
    expect(formatDateTime(null)).toBe('');
  });
});

describe('formatRelativeTime', () => {
  it('should format recent time with "前" suffix', () => {
    const now = new Date();
    const result = formatRelativeTime(now);
    // date-fns might return "不到 1 分钟前" which our code converts
    expect(result).toBeTruthy();
    expect(result).toContain('前');
  });

  it('should format time in minutes', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const result = formatRelativeTime(date);
    expect(result).toContain('分钟');
  });

  it('should format time in hours', () => {
    const date = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    const result = formatRelativeTime(date);
    expect(result).toContain('小时');
  });

  it('should format time in days', () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    const result = formatRelativeTime(date);
    expect(result).toContain('天');
  });

  it('should return empty string for null input', () => {
    expect(formatRelativeTime(null)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(formatRelativeTime('invalid')).toBe('');
  });
});
