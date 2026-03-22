/**
 * useModalStates Hook
 * 统一管理所有模态框的状态
 * 从 App.jsx 提取出来的模态框状态管理逻辑
 */

import { useState, useCallback } from 'react';

/**
 * 自定义 Hook: 管理模态框状态
 * @returns {Object} 模态框状态和操作函数
 */
export function useModalStates() {
  // 模态框显示状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [detailPrompt, setDetailPrompt] = useState(null);

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null
  });

  /**
   * 打开新增模态框
   */
  const openAddModal = useCallback(() => {
    setShowAddModal(true);
  }, []);

  /**
   * 关闭新增模态框
   */
  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
  }, []);

  /**
   * 打开导入模态框
   */
  const openImportModal = useCallback(() => {
    setShowImportModal(true);
  }, []);

  /**
   * 关闭导入模态框
   */
  const closeImportModal = useCallback(() => {
    setShowImportModal(false);
  }, []);

  /**
   * 打开导出模态框
   */
  const openExportModal = useCallback(() => {
    setShowExportModal(true);
  }, []);

  /**
   * 关闭导出模态框
   */
  const closeExportModal = useCallback(() => {
    setShowExportModal(false);
  }, []);

  /**
   * 打开详情模态框
   */
  const openDetailModal = useCallback((prompt) => {
    setDetailPrompt(prompt);
  }, []);

  /**
   * 关闭详情模态框
   */
  const closeDetailModal = useCallback(() => {
    setDetailPrompt(null);
  }, []);

  /**
   * 显示确认对话框
   */
  const showConfirm = useCallback((title, message, onConfirm) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  }, []);

  /**
   * 关闭确认对话框
   */
  const closeConfirm = useCallback(() => {
    setConfirmDialog({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null
    });
  }, []);

  /**
   * 关闭所有模态框
   */
  const closeAllModals = useCallback(() => {
    setShowAddModal(false);
    setShowImportModal(false);
    setShowExportModal(false);
    setDetailPrompt(null);
    setConfirmDialog({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null
    });
  }, []);

  return {
    // 模态框状态
    showAddModal,
    showImportModal,
    showExportModal,
    detailPrompt,
    confirmDialog,

    // 操作函数
    openAddModal,
    closeAddModal,
    openImportModal,
    closeImportModal,
    openExportModal,
    closeExportModal,
    openDetailModal,
    closeDetailModal,
    showConfirm,
    closeConfirm,
    closeAllModals,
  };
}
