import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./lib/supabase";

// Components
import AuthPage from "./components/auth/AuthPage";
import PromptCard from "./components/prompts/PromptCard";
import DetailModal from "./components/prompts/DetailModal";
import AddPromptModal from "./components/prompts/AddPromptModal";
import ImportModal from "./components/prompts/ImportModal";
import ExportModal from "./components/prompts/ExportModal";
import AlertDialog from "./components/ui/dialogs/AlertDialog";
import ConfirmDialog from "./components/ui/dialogs/ConfirmDialog";
import CommunityPage from "./components/community/CommunityPage";
import ErrorBoundary from "./components/ui/ErrorBoundary";

// Constants & Utilities
import { DEFAULT_CATEGORIES, CATEGORY_COLORS } from "./constants/categories";
import { MODELS, APP_FONT } from "./constants/app";
import { validatePrompt } from "./utils/validation";
import { sanitizeInput } from "./utils/sanitize";
import { formatPromptData } from "./utils/community";

// Icons
import { LogoIcon, CloseIcon, PlusIcon, UploadIcon, DownloadIcon, SearchIcon, LoadingSpinner, EmptyStateIcon, CommunityIcon } from "./components/ui/icons";

// ─── Main App ─────────────────────────────────────────────────────────────────

function MainApp({ user, onLogout, onShowCommunity, onShowAlert }) {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [detailPrompt, setDetailPrompt] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [showExportModal, setShowExportModal] = useState(false);

  // 加载分类
  useEffect(() => {
    fetchCategories();
  }, [user]);

  // 加载 prompts
  useEffect(() => {
    if (user) fetchPrompts();
  }, [user]);

  // 监听认证状态变化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        onLogout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCategories = async () => {
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
        // 使用去重后的分类数据
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("加载分类失败:", error);
      setError(error.message);
      setCategories([]);
    }
  };

  const fetchPrompts = async () => {
    setLoading(true);
    setError(null);

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
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
              <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-blue-100 flex items-center justify-center aspect-square">
                <span className="text-xs font-semibold text-blue-600">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <span className="text-xs text-gray-600 font-medium hidden sm:block">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-1"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-7">
        {/* Search */}
        <div className="relative mb-5">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </div>
          <input
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all shadow-sm"
            placeholder="搜索提示词标题或内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <CloseIcon />
            </button>
          )}
        </div>

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
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <LoadingSpinner />
            </div>
            <p className="text-sm text-gray-400">加载中...</p>
          </div>
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
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <EmptyStateIcon />
            </div>
            <p className="text-sm text-gray-400">没有找到相关提示词</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              className="mt-2 text-xs text-blue-500 hover:text-blue-600"
            >
              清除筛选
            </button>
          </div>
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
          categories={categories}
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
  const [loading, setLoading] = useState(true);
  const [showCommunity, setShowCommunity] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: "", message: "" });

  // Stable callback for showing alerts
  const onShowAlert = useCallback((title, message) => {
    setAlertDialog({ isOpen: true, title, message });
  }, []);

  useEffect(() => {
    // 检查当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0]
        });
      }
      setLoading(false);
    });

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0]
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
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
      {/* Community Page - render at root level so it works for both logged in and logged out users */}
      {showCommunity && (
        <CommunityPage
          user={user}
          onClose={() => setShowCommunity(false)}
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
            onLogout={() => setUser(null)}
            onShowCommunity={() => setShowCommunity(true)}
            onShowAlert={(title, message) => setAlertDialog({ isOpen: true, title, message })}
          />
        </ErrorBoundary>
      )}
    </>
  );
}
