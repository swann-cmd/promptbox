import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "./lib/supabase";
import { ThemeProvider } from "./context/ThemeContext";

// Components - 使用新的 hooks 和组件
import { usePromptData } from "./hooks/usePromptData";
import { useCategoryData } from "./hooks/useCategoryData";
import { useModalStates } from "./hooks/useModalStates";
import AuthPage from "./components/auth/AuthPage";
import {
  PromptCard,
  AddPromptModal,
  DetailModal,
  ImportModal,
  ExportModal
} from "./components/prompts";
import {
  AlertDialog,
  ConfirmDialog,
  ErrorBoundary,
  SearchInput,
} from "./components/ui";
import {
  AppHeader,
  CategoryTabs,
  PromptGrid
} from "./components/app";
import {
  CommunityPage
} from "./components/community";
import {
  UserProfilePage,
  UserProfileModal
} from "./components/user";

// Constants & Utilities
import { MODELS, APP_FONT } from "./constants/app";
import { getOrCreateUserProfile } from "./utils/community";

// ─── Main App ─────────────────────────────────────────────────────────────────

function MainApp({ user, userProfile, setUserProfile, onLogout, onShowCommunity, onShowAlert, onShowProfileModal }) {
  // 使用自定义 hooks 管理状态
  const {
    prompts,
    loading,
    fetchPrompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    incrementUsage,
  } = usePromptData(user?.id);

  const {
    categories,
    loading: categoriesLoading,
  } = useCategoryData(user?.id);

  const {
    showAddModal,
    showImportModal,
    showExportModal,
    detailPrompt,
    confirmDialog,
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
  } = useModalStates();

  // 本地状态
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ============== useEffect Hooks ==============

  // 加载用户档案
  useEffect(() => {
    if (user && !userProfile) {
      getOrCreateUserProfile(user.id).then(setUserProfile).catch(err => {
        console.error('加载用户档案失败:', err);
      });
    }
  }, [user, userProfile]);

  // 监听认证状态变化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        onLogout();
      }
    });

    return () => subscription.unsubscribe();
  }, [onLogout]);

  // ============== Event Handlers ==============

  const handleCopy = async (id) => {
    await incrementUsage(id);
  };

  const handleAdd = async (form) => {
    await addPrompt(form);
    closeAddModal();
  };

  const handleUpdate = async (id, form) => {
    const result = await updatePrompt(id, form);
    if (result.prompt && detailPrompt?.id === id) {
      openDetailModal(result.prompt);
    }
  };

  const handleDelete = async (id) => {
    showConfirm(
      "删除 Prompt",
      "确定要删除这个 Prompt 吗？此操作无法撤销。",
      async () => {
        try {
          await deletePrompt(id);
          closeConfirm();
        } catch (error) {
          console.error("删除失败:", error);
          closeConfirm();
          onShowAlert("删除失败", error.message);
        }
      }
    );
  };

  // 使用 useMemo 缓存分类映射，避免每次渲染重新创建
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(cat => {
      map[cat.name] = cat.id;
    });
    return map;
  }, [categories]);

  const handleImport = async (data) => {
    // 导入数据
    const { sanitizeInput } = await import("./utils/sanitize");
    const promptsToInsert = data.map(item => ({
      user_id: user.id,
      title: sanitizeInput(item.title, 200),
      content: sanitizeInput(item.content, 10000),
      category_id: categoryMap[item.categoryName] || null,
      model: "通用",
      usage_count: 0
    }));

    const { error } = await supabase
      .from("prompts")
      .insert(promptsToInsert)
      .select();

    if (error) throw error;

    await fetchPrompts();
    closeImportModal();
  };

  // 过滤逻辑
  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      const matchCat = activeCategory === "all" || p.categorySlug === activeCategory;
      const matchSearch = !searchQuery ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [prompts, activeCategory, searchQuery]);

  // 分类统计
  const categoryCounts = prompts.reduce((acc, p) => {
    if (p.categorySlug) {
      acc[p.categorySlug] = (acc[p.categorySlug] || 0) + 1;
    }
    return acc;
  }, {});

  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      count: categoryCounts[cat.slug] || 0
    }));
  }, [categories, categoryCounts]);

  const totalCount = prompts.length;
  const totalUsage = prompts.reduce((a, p) => a + p.usageCount, 0);

  const clearFilter = () => {
    setSearchQuery("");
    setActiveCategory("all");
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg" style={APP_FONT}>
      {/* Header */}
      <AppHeader
        user={user}
        userProfile={userProfile}
        onAdd={openAddModal}
        onImport={openImportModal}
        onExport={openExportModal}
        onCommunity={onShowCommunity}
        onLogout={onLogout}
        onShowProfile={onShowProfileModal}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-7">
        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索提示词标题或内容..."
          color="blue"
          className="mb-4 sm:mb-5"
        />

        {/* Category Tabs */}
        {!categoriesLoading && (
          <CategoryTabs
            categories={categoriesWithCounts}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            totalCount={totalCount}
          />
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400 dark:text-dark-textSecondary">
            共 <span className="font-semibold text-gray-600 dark:text-dark-text">{filtered.length}</span> 条提示词
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-textSecondary">
            累计使用 <span className="font-semibold text-gray-600 dark:text-dark-text">{totalUsage}</span> 次
          </p>
        </div>

        {/* Prompt Grid */}
        <PromptGrid
          prompts={filtered}
          loading={loading}
          onCopy={handleCopy}
          onClick={openDetailModal}
          onDelete={handleDelete}
          onClearFilter={(searchQuery || activeCategory !== "all") ? clearFilter : null}
        />
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPromptModal
          onClose={closeAddModal}
          onAdd={handleAdd}
          categories={categories}
        />
      )}
      {showImportModal && (
        <ImportModal
          onClose={closeImportModal}
          onImport={handleImport}
          onError={onShowAlert}
        />
      )}
      {showExportModal && (
        <ExportModal
          onClose={closeExportModal}
          prompts={prompts}
          categories={categories}
          onError={onShowAlert}
        />
      )}
      {detailPrompt && (
        <DetailModal
          key={detailPrompt.id}
          prompt={detailPrompt}
          user={user}
          onClose={closeDetailModal}
          onCopy={handleCopy}
          onUpdate={handleUpdate}
          onPublishSuccess={fetchPrompts}
          onWithdrawSuccess={fetchPrompts}
          categories={categories}
          models={MODELS}
          onError={onShowAlert}
        />
      )}

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  </>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCommunity, setShowCommunity] = useState(() => window.location.hash === '#community');
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: "", message: "" });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Use ref to store auth subscription, ensuring proper cleanup
  const authSubscriptionRef = useRef(null);

  // Stable callback for showing alerts
  const onShowAlert = useCallback((title, message) => {
    setAlertDialog({ isOpen: true, title, message });
  }, []);

  // 打开/关闭社区页面时更新 URL hash
  useEffect(() => {
    if (showCommunity) {
      window.location.hash = 'community';
    } else {
      if (window.location.hash === '#community') {
        history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      }
    }
  }, [showCommunity]);

  // 监听 hash 变化，自动打开/关闭社区页面
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#community') {
        setShowCommunity(true);
      } else if (window.location.hash === '' && showCommunity) {
        setShowCommunity(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [showCommunity]);

  useEffect(() => {
    // 检查当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // 只提取必要的用户字段，避免暴露敏感元数据
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0]
        });
      }
      setLoading(false);
    });

    // 监听认证状态变化 - 使用 ref 确保正确清理
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // 只提取必要的用户字段，避免暴露敏感元数据（如 phone、confirmed_at 等）
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0]
        });
      } else {
        setUser(null);
      }
    });

    // 存储订阅到 ref
    authSubscriptionRef.current = subscription;

    // Cleanup function - 确保正确清理订阅
    return () => {
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg" style={APP_FONT}>
        <div className="text-gray-500 dark:text-dark-textSecondary">加载中...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      {/* Community Page */}
      {showCommunity && (
        <CommunityPage
          user={user}
          onClose={() => setShowCommunity(false)}
          onError={onShowAlert}
          onShowUserProfile={setSelectedUserId}
        />
      )}

      {/* User Profile Page */}
      {selectedUserId && (
        <UserProfilePage
          userId={selectedUserId}
          currentUser={user}
          onClose={() => setSelectedUserId(null)}
          onError={onShowAlert}
        />
      )}

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        onConfirm={() => setAlertDialog({ isOpen: false, title: "", message: "" })}
      />

      {!user ? (
        <AuthPage onLogin={setUser} onShowCommunity={() => setShowCommunity(true)} />
      ) : (
        <ErrorBoundary>
          <MainApp
            user={user}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onLogout={() => {
              setUser(null);
              setUserProfile(null);
            }}
            onShowCommunity={() => setShowCommunity(true)}
            onShowAlert={(title, message) => setAlertDialog({ isOpen: true, title, message })}
            onShowProfileModal={() => setShowProfileModal(true)}
          />
        </ErrorBoundary>
      )}

      {/* User Profile Modal */}
      {showProfileModal && userProfile && (
        <UserProfileModal
          user={{ ...user, ...userProfile }}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(updatedProfile) => {
            setUserProfile(updatedProfile);
            setShowProfileModal(false);
            onShowAlert('保存成功', '个人资料已更新');
          }}
          onError={onShowAlert}
        />
      )}
    </ThemeProvider>
  );
}
