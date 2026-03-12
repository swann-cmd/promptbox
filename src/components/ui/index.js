/**
 * UI Components Barrel Export
 * 集中导出所有 UI 组件，简化导入路径
 */

// Layout Components
export { default as ModalWrapper } from './ModalWrapper';
export { default as ErrorBoundary } from './ErrorBoundary';

// Action Components
export { default as CategoryBadge } from './CategoryBadge';
export { default as CopyButton } from './CopyButton';
export { default as ToggleButton } from './ToggleButton';

// Dialogs
export { default as Dialog } from './dialogs/Dialog';
export { default as AlertDialog } from './dialogs/AlertDialog';
export { default as ConfirmDialog } from './dialogs/ConfirmDialog';

// Icons
export * from './icons';
