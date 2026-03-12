import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase } from "./lib/supabase";

// Components - 使用 barrel exports 简化导入
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
  LoadingState,
  EmptyState as EmptyStateUI
} from "./components/ui";
import {
  CommunityPage
} from "./components/community";
import {
  UserProfilePage,
  UserProfileModal
} from "./components/user";
import {
  LogoIcon,
  PlusIcon,
  UploadIcon,
  DownloadIcon,
  LoadingSpinner,
  CommunityIcon
} from "./components/ui/icons";

// Constants & Utilities
import { DEFAULT_CATEGORIES } from "./constants/categories";
import { MODELS, APP_FONT } from "./constants/app";
import { validatePrompt, sanitizeInput } from "./utils/sanitize";
import { formatPromptData, getOrCreateUserProfile } from "./utils/community";

// ─── Main App ─────────────────────────────────────────────────────────────────

function MainApp({ user, userProfile, setUserProfile, onLogout, onShowCommunity, onShowAlert, onShowProfileModal }) {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [detailPrompt, setDetailPrompt] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchCategories = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // 去重：根据 slug 去重，保留最新的记录
      const uniqueCategories = [];
      const seenSlugs = new Set();

      if (data) {
        // 从后往前遍历，保留最新的记录
        for (let i = data.length - 1; i >= 0; i--) {
          const cat = data[i];
          if (!seenSlugs.has(cat.slug)) {
            seenSlugs.add(cat.slug);
            uniqueCategories.unshift(cat);
          }
        }
      }

      // 如果没有分类，自动创建默认分类
      if (!uniqueCategories || uniqueCategories.length === 0) {
        console.log("检测到用户没有分类，正在创建默认分类...");
        const newCategories = DEFAULT_CATEGORIES.map(cat => ({
          user_id: user.id,
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
        const existingSlugs = new Set(uniqueCategories.map(cat => cat.slug));
        const missingCategories = DEFAULT_CATEGORIES.filter(
          defaultCat => !existingSlugs.has(defaultCat.slug)
        );

        if (missingCategories.length > 0) {
          console.log("检测到新增的分类，正在补充:", missingCategories.map(c => c.name));
          const newCategories = missingCategories.map(cat => ({
            user_id: user.id,
            name: cat.name,
            slug: cat.slug
          }));

          const { data: newData, error: insertError } = await supabase
            .from("categories")
            .insert(newCategories)
            .select();

          if (!insertError && newData) {
            console.log("新分类补充成功:", newData);
            // 合并新旧分类，按 DEFAULT_CATEGORIES 的顺序排列
            const allCategories = [
              ...newData,
              ...uniqueCategories
            ];
            // 按照默认分类的顺序排序
            const orderedCategories = DEFAULT_CATEGORIES
              .map(defaultCat =>
                allCategories.find(cat => cat.slug === defaultCat.slug)
              )
              .filter(Boolean); // 过滤掉 undefined
            setCategories(orderedCategories);
          } else {
            console.warn("补充新分类失败，使用现有分类:", insertError);
            setCategories(uniqueCategories);
          }
        } else {
          // 使用去重后的分类数据
          setCategories(uniqueCategories);
        }
      }
    } catch (error) {
      console.error("加载分类失败:", error);
      setCategories([]);
    }
  }, [user?.id]);

  const fetchPrompts = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("prompts")
        .select("*, categories(name, slug)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 查询已发布的社区提示词
      const { data: communityData, error: communityError } = await supabase
        .from("community_prompts")
        .select("prompt_id, status")
        .eq("user_id", user.id)
        .eq("status", "published");

      let publishedPromptIds = new Set();
      if (!communityError && communityData) {
        publishedPromptIds = new Set(communityData.map(cp => cp.prompt_id));
      }

      setPrompts(formatPromptData(data, publishedPromptIds));
    } catch (error) {
      console.error("加载 prompts 失败:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ============== useEffect Hooks ==============
  // 注意：所有 useEffect 必须在函数定义之后

  // 加载分类
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 加载 prompts
  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  // 加载用户档案
  useEffect(() => {
    if (user && !userProfile) {
      getOrCreateUserProfile(user.id).then(setUserProfile).catch(err => {
        console.error('加载用户档案失败:', err);
      });
    }
  }, [user, userProfile]); // 移除 setUserProfile，避免不必要的重渲染

  // 监听认证状态变化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        onLogout();
      }
    });

    return () => subscription.unsubscribe();
  }, [onLogout]);

  const handleCopy = async (id) => {
    try {
      const { error } = await supabase.rpc("increment_usage_count", { prompt_id: id });

      if (error) throw error;

      setPrompts(prev => prev.map(p =>
        p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
      ));

      if (detailPrompt?.id === id) {
        setDetailPrompt(prev => prev ? { ...prev, usageCount: prev.usageCount + 1 } : null);
      }
    } catch (error) {
      console.error("更新使用计数失败:", error);
    }
  };

  const handleAdd = async (form) => {
    try {
      validatePrompt(form.title, form.content);

      const sanitizedTitle = sanitizeInput(form.title, 200);
      const sanitizedContent = sanitizeInput(form.content, 10000);
      const sanitizedTags = (form.tags || [])
        .map(tag => sanitizeInput(tag.trim(), 50))
        .filter(tag => tag.length > 0)
        .slice(0, 10);

      const { error } = await supabase
        .from("prompts")
        .insert({
          user_id: user.id,
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

      await fetchPrompts();
    } catch (error) {
      console.error("添加失败:", error);
      throw error;
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      validatePrompt(form.title, form.content);

      const sanitizedTitle = sanitizeInput(form.title, 200);
      const sanitizedContent = sanitizeInput(form.content, 10000);
      const sanitizedTags = (form.tags || [])
        .map(tag => sanitizeInput(tag.trim(), 50))
        .filter(tag => tag.length > 0)
        .slice(0, 10);

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

      // 保留原有的发布状态
      const existingPrompt = prompts.find(p => p.id === id);

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
        isPublishedToCommunity: existingPrompt?.isPublishedToCommunity || false
      };

      setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p));
      setDetailPrompt(prev => prev?.id === id ? updatedPrompt : prev);
    } catch (error) {
      console.error("更新失败:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "删除 Prompt",
      message: "确定要删除这个 Prompt 吗？此操作无法撤销。",
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from("prompts")
            .delete()
            .eq("id", id);

          if (error) throw error;

          setPrompts(prev => prev.filter(p => p.id !== id));
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
        } catch (error) {
          console.error("删除失败:", error);
          setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
          onShowAlert("删除失败", error.message);
        }
      }
    });
  };

  const handleImport = async (data) => {
    try {
      data.forEach(item => {
        validatePrompt(item.title, item.content);
      });

      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });

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
    } catch (error) {
      console.error("导入失败:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
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

  const allCategories = [
    { id: "all", slug: "all", name: "全部", count: prompts.length },
    ...categories.map(c => ({
      ...c,
      count: categoryCounts[c.slug] || 0
    }))
  ];

  const totalCount = prompts.reduce((a, p) => a + p.usageCount, 0);

  return (
    <>
    <div className="min-h-screen bg-gray-50" style={APP_FONT}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <LogoIcon />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">PromptBox</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200"
              title="新增"
            >
              <PlusIcon />
              <span className="hidden sm:inline">新增</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors"
              title="导入"
            >
              <UploadIcon />
              <span className="hidden sm:inline">导入</span>
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors"
              title="导出"
            >
              <DownloadIcon />
              <span className="hidden sm:inline">导出</span>
            </button>
            <button
              onClick={onShowCommunity}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-purple-200"
              title="社区广场"
            >
              <CommunityIcon />
              <span className="hidden sm:inline">社区</span>
            </button>
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-100">
              <button
                onClick={onShowProfileModal}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-full pr-2 pl-1 py-0.5 -ml-1 transition-colors"
                title="编辑个人资料"
              >
                <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-blue-100 flex items-center justify-center aspect-square">
                  <span className="text-xs font-semibold text-blue-600">
                    {userProfile?.display_name?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-xs text-gray-600 font-medium hidden sm:block">
                  {userProfile?.display_name || user.name || user.email}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-7">
        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索提示词标题或内容..."
          color="blue"
          className="mb-5"
        />

        {/* Category Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {allCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug === "all" ? "all" : cat.slug)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                (activeCategory === "all" && cat.slug === "all") || activeCategory === cat.slug
                  ? "bg-blue-500 text-white shadow-sm shadow-blue-200"
                  : "bg-white text-gray-500 hover:text-gray-700 border border-gray-100 hover:border-gray-200"
              }`}
            >
              {cat.name}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                (activeCategory === "all" && cat.slug === "all") || activeCategory === cat.slug
                  ? "bg-blue-400/50 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">
            共 <span className="font-semibold text-gray-600">{filtered.length}</span> 条提示词
          </p>
          <p className="text-xs text-gray-400">
            累计使用 <span className="font-semibold text-gray-600">{totalCount}</span> 次
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <LoadingState
            icon={<LoadingSpinner />}
            message="加载中..."
          />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <PromptCard
                key={p.id}
                prompt={p}
                onCopy={handleCopy}
                onClick={setDetailPrompt}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyStateUI
            icon={<EmptyStateIcon />}
            title="没有找到相关提示词"
            message="试试调整搜索词或选择其他分类"
            action={
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                清除筛选
              </button>
            }
          />
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPromptModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
          categories={categories}
        />
      )}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          onError={onShowAlert}
        />
      )}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
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
          onClose={() => setDetailPrompt(null)}
          onCopy={(id) => { handleCopy(id); }}
          onUpdate={handleUpdate}
          onPublishSuccess={fetchPrompts}
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
        onCancel={() => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null })}
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50" style={APP_FONT}>
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <>
      {/* 逐步测试：恢复 CommunityPage */}
      {showCommunity && (
        <CommunityPage
          user={user}
          onClose={() => setShowCommunity(false)}
          onError={onShowAlert}
          onShowUserProfile={setSelectedUserId}
        />
      )}

      {/* 恢复 UserProfilePage */}
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
    </>
  );
}
