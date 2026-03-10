import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

// ─── Constants ───────────────────────────────────────────────────────────────────

const MODELS = ["通用", "ChatGPT", "Claude", "Gemini", "Midjourney", "Sora"];

const DEFAULT_CATEGORIES = [
  { name: "产品", slug: "product" },
  { name: "写作", slug: "writing" },
  { name: "数据", slug: "data" },
  { name: "学习", slug: "learning" },
  { name: "AI", slug: "ai" },
  { name: "创业", slug: "startup" },
  { name: "思维", slug: "thinking" },
  { name: "个人效率", slug: "productivity" },
  { name: "开发", slug: "development" },
  { name: "视频", slug: "video" },
];

const categoryColors = {
  product: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400", accent: "#3b82f6" },
  writing: { bg: "bg-violet-50", text: "text-violet-600", dot: "bg-violet-400", accent: "#7c3aed" },
  data: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400", accent: "#059669" },
  learning: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400", accent: "#d97706" },
  ai: { bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-400", accent: "#e11d48" },
  startup: { bg: "bg-cyan-50", text: "text-cyan-600", dot: "bg-cyan-400", accent: "#0891b2" },
  thinking: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-400", accent: "#9333ea" },
  productivity: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-400", accent: "#22c55e" },
  development: { bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-400", accent: "#6366f1" },
  video: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400", accent: "#f97316" },
};

const APP_FONT = { fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif" };

// ─── Shared Components ───────────────────────────────────────────────────────

function CategoryBadge({ categorySlug, categoryName }) {
  const colors = categoryColors[categorySlug] || { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-300" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {categoryName || categorySlug}
    </span>
  );
}

function CopyButton({ text, onCopy, size = "sm", disabled = false }) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    if (disabled) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onCopy) await onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  const base = size === "lg"
    ? "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
    : "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200";

  return (
    <button
      onClick={handle}
      disabled={disabled}
      className={`${base} ${copied ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {copied ? (
        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>已复制</>
      ) : (
        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>复制</>
      )}
    </button>
  );
}

// ─── Auth Page ───────────────────────────────────────────────────────────────

function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) { setError("请填写完整信息"); return; }

    if (tab === "register") {
      if (form.password !== form.confirmPassword) { setError("两次密码不一致"); return; }
      if (form.password.length < 6) { setError("密码至少 6 位"); return; }
    }

    setLoading(true);

    try {
      if (tab === "register") {
        // 注册
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { name: form.name || form.email.split("@")[0] }
          }
        });

        if (signUpError) throw signUpError;

        // 注册成功后自动登录，创建默认分类
        if (data.user) {
          try {
            await createDefaultCategories(data.user.id);
          } catch (err) {
            console.warn("创建分类时出错，但不影响登录:", err);
          }
          onLogin({ id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || form.email.split("@")[0] });
        }
      } else {
        // 登录
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          onLogin({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || form.email.split("@")[0]
          });
        }
      }
    } catch (err) {
      setError(err.message || "操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async (userId) => {
    try {
      // 先检查是否已经有分类
      const { data: existingCategories } = await supabase
        .from("categories")
        .select("slug")
        .eq("user_id", userId);

      if (existingCategories && existingCategories.length > 0) {
        console.log("用户已有分类，跳过创建");
        return;
      }

      const categories = DEFAULT_CATEGORIES.map(cat => ({
        user_id: userId,
        name: cat.name,
        slug: cat.slug
      }));

      const { data, error } = await supabase.from("categories").insert(categories).select();

      if (error) {
        console.error("创建默认分类失败:", error);
        throw error;
      }
      console.log("默认分类创建成功:", data);
    } catch (error) {
      console.error("创建默认分类失败:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={APP_FONT}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.346A3.001 3.001 0 0012 15a3 3 0 00-2.99 2.757l-.347-.346z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">PromptBox</h1>
          <p className="text-sm text-gray-400 mt-1">你的 AI 提示词库</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 p-6" style={{ minHeight: 420 }}>
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {[{ id: "login", label: "登录" }, { id: "register", label: "注册" }].map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(""); setForm({ email: "", password: "", confirmPassword: "", name: "" }); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* All fields */}
          <div className="space-y-3.5">
            {/* 姓名 — register only */}
            <div style={{ overflow: "hidden", maxHeight: tab === "register" ? 80 : 0, opacity: tab === "register" ? 1 : 0, transition: "max-height 0.25s ease, opacity 0.2s ease" }}>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">姓名</label>
              <input
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="你的名字"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                tabIndex={tab === "register" ? 0 : -1}
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">邮箱</label>
              <input
                type="email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">密码</label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* 确认密码 — register only */}
            <div style={{ overflow: "hidden", maxHeight: tab === "register" ? 80 : 0, opacity: tab === "register" ? 1 : 0, transition: "max-height 0.25s ease, opacity 0.2s ease" }}>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">确认密码</label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                tabIndex={tab === "register" ? 0 : -1}
              />
            </div>
          </div>

          {/* Error */}
          <div style={{ overflow: "hidden", maxHeight: error ? 60 : 0, opacity: error ? 1 : 0, transition: "max-height 0.2s ease, opacity 0.15s ease" }}>
            <div className="mt-3.5 px-3.5 py-2.5 bg-red-50 rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-5 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "处理中..." : (tab === "login" ? "登录" : "创建账号")}
          </button>

          {/* 忘记密码 — login only */}
          <div style={{ overflow: "hidden", maxHeight: tab === "login" ? 40 : 0, opacity: tab === "login" ? 1 : 0, transition: "max-height 0.2s ease, opacity 0.15s ease" }}>
            <button className="w-full mt-3 text-xs text-blue-500 hover:text-blue-600 text-center">
              忘记密码？
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          继续即表示同意 <span className="text-blue-500 cursor-pointer">服务条款</span> 和 <span className="text-blue-500 cursor-pointer">隐私政策</span>
        </p>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ prompt, onClose, onCopy, onUpdate, categories, models }) {
  if (!prompt) return null;
  const colors = categoryColors[prompt.categorySlug] || {};
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ title: prompt.title, content: prompt.content, categoryId: prompt.categoryId, model: prompt.model });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      await onUpdate(prompt.id, form);
      setIsEditing(false);
    } catch (error) {
      console.error("更新失败:", error);
      alert("更新失败: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ title: prompt.title, content: prompt.content, categoryId: prompt.categoryId, model: prompt.model });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  className="w-full text-lg font-semibold text-gray-900 leading-snug mb-2.5 border-b-2 border-blue-500 focus:outline-none pb-1"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="提示词标题"
                />
              ) : (
                <h2 className="text-lg font-semibold text-gray-900 leading-snug mb-2.5">{prompt.title}</h2>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    >
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                    >
                      {models.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <CategoryBadge categorySlug={prompt.categorySlug} categoryName={prompt.categoryName} />
                    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full font-medium">{prompt.model}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="取消"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.title.trim() || !form.content.trim()}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "保存中..." : "保存"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 transition-colors"
                    title="编辑"
                  >
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "calc(85vh - 200px)" }}>
          {isEditing ? (
            <textarea
              className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 border-2 border-transparent focus:border-blue-400 transition-all"
              rows={12}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="输入提示词内容..."
            />
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{prompt.content}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isEditing && (
          <div className="px-6 pb-6 pt-3 border-t border-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  使用 <span className="font-semibold text-gray-600">{prompt.usageCount}</span> 次
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(prompt.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
              <CopyButton text={prompt.content} onCopy={() => onCopy(prompt.id)} size="lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add Prompt Modal ─────────────────────────────────────────────────────────

function AddPromptModal({ onClose, onAdd, categories, loading }) {
  const [form, setForm] = useState({ title: "", content: "", categoryId: "", model: "通用" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(form);
      onClose();
    } catch (error) {
      console.error("添加失败:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">添加 Prompt</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">标题</label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="给这个 Prompt 起个名字"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">内容</label>
            <textarea
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
              placeholder="输入提示词内容..."
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">场景分类</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">选择分类</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">适用模型</label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              >
                {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">取消</button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim() || !form.content.trim() || !form.categoryId || submitting}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "添加中..." : "添加"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Import Modal ─────────────────────────────────────────────────────────────

function ImportModal({ onClose, onImport, categories }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);

  const downloadTemplate = () => {
    const template = `标题,文案,分类
写作助手,你是一个专业的写作助手，请帮我润色这段文字,写作
代码审查,请审查以下代码，找出潜在的问题和改进建议,编程
翻译助手,请将以下文本翻译成英文，保持原意不变,写作
数据分析,请分析以下数据并提供可视化建议,分析`;

    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'prompts_template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Parse CSV
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());

      // Skip header row, parse data
      const data = lines.slice(1).map(line => {
        const parts = line.split(',');
        return {
          title: parts[0]?.trim() || '',
          content: parts[1]?.trim() || '',
          categoryName: parts[2]?.trim() || ''
        };
      }).filter(item => item.title && item.content);

      setPreview(data.slice(0, 10)); // Show first 10 for preview
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file || preview.length === 0) return;
    setImporting(true);
    try {
      await onImport(preview);
      onClose();
    } catch (error) {
      console.error("导入失败:", error);
      alert("导入失败: " + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">导入 Prompts</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-300 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">点击上传 CSV 文件</p>
              <p className="text-xs text-gray-400">支持格式：CSV（标题,文案,分类）</p>
            </label>
            {file && (
              <p className="text-xs text-blue-500 mt-2">已选择：{file.name}</p>
            )}
          </div>

          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载导入模板
          </button>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">预览（前 10 条）</p>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">标题</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">文案</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">分类</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900 max-w-xs truncate">{item.title}</td>
                        <td className="px-3 py-2 text-gray-500 max-w-xs truncate">{item.content}</td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600">
                            {item.categoryName || '未分类'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">取消</button>
          <button
            onClick={handleImport}
            disabled={!file || preview.length === 0 || importing}
            className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {importing ? "导入中..." : `导入 ${preview.length} 条`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Prompt Card ──────────────────────────────────────────────────────────────

function PromptCard({ prompt, onCopy, onClick, onDelete }) {
  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer relative"
      onClick={() => onClick(prompt)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">{prompt.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge categorySlug={prompt.categorySlug} categoryName={prompt.categoryName} />
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{prompt.model}</span>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <CopyButton text={prompt.content} onCopy={() => onCopy(prompt.id)} />
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="删除"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2">{prompt.content}</p>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {prompt.usageCount} 次
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(prompt.createdAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
        <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors flex items-center gap-1">
          查看详情
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function MainApp({ user, onLogout }) {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [detailPrompt, setDetailPrompt] = useState(null);

  // 加载分类
  useEffect(() => {
    fetchCategories();
  }, [user]);

  // 加载 prompts（只在用户变化时重新获取）
  useEffect(() => {
    if (user) fetchPrompts();
  }, [user]);

  // 监听认证状态变化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
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

      // 如果没有分类，自动创建默认分类
      if (!data || data.length === 0) {
        console.log("检测到用户没有分类，正在创建默认分类...");
        const categories = DEFAULT_CATEGORIES.map(cat => ({
          user_id: user.id,
          name: cat.name,
          slug: cat.slug
        }));

        const { data: newData, error: insertError } = await supabase
          .from("categories")
          .insert(categories)
          .select();

        if (insertError) {
          console.error("创建默认分类失败:", insertError);
          setCategories([]);
        } else {
          console.log("默认分类创建成功:", newData);
          setCategories(newData || []);
        }
      } else {
        // 检查是否需要更新到新的分类系统
        const oldSlugs = ['writing', 'coding', 'analysis', 'image', 'video'];
        const hasOldCategories = data.some(cat => oldSlugs.includes(cat.slug));

        if (hasOldCategories) {
          console.log("检测到旧版分类，正在更新到新的分类系统...");

          // 删除旧的5个分类
          const { error: deleteError } = await supabase
            .from("categories")
            .delete()
            .in('slug', oldSlugs)
            .eq("user_id", user.id);

          if (deleteError) {
            console.error("删除旧分类失败:", deleteError);
          } else {
            console.log("旧分类已删除");

            // 创建新的8个分类
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
              console.error("创建新分类失败:", insertError);
              setCategories(data);
            } else {
              console.log("新分类创建成功:", newData);
              setCategories(newData || []);
            }
          }
        } else {
          setCategories(data);
        }
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
      // 总是获取所有 prompts，不过滤分类
      const { data, error } = await supabase
        .from("prompts")
        .select("*, categories(name, slug)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 转换数据格式
      const formattedData = (data || []).map(p => ({
        id: p.id,
        title: p.title,
        content: p.content,
        categoryId: p.category_id,
        categoryName: p.categories?.name,
        categorySlug: p.categories?.slug,
        model: p.model,
        usageCount: p.usage_count,
        createdAt: p.created_at
      }));

      setPrompts(formattedData);
    } catch (error) {
      console.error("加载 prompts 失败:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (id) => {
    try {
      // 调用函数增加使用计数
      const { error } = await supabase.rpc("increment_usage_count", { prompt_id: id });

      if (error) throw error;

      // 更新本地状态
      setPrompts(prev => prev.map(p =>
        p.id === id ? { ...p, usageCount: p.usageCount + 1 } : p
      ));

      // 更新详情模态框中的状态
      if (detailPrompt?.id === id) {
        setDetailPrompt(prev => prev ? { ...prev, usageCount: prev.usageCount + 1 } : null);
      }
    } catch (error) {
      console.error("更新使用计数失败:", error);
    }
  };

  const handleAdd = async (form) => {
    try {
      const { data, error } = await supabase
        .from("prompts")
        .insert({
          user_id: user.id,
          title: form.title,
          content: form.content,
          category_id: form.categoryId,
          model: form.model,
          usage_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      // 刷新列表
      await fetchPrompts();
    } catch (error) {
      console.error("添加失败:", error);
      throw error;
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      const { data, error } = await supabase
        .from("prompts")
        .update({
          title: form.title,
          content: form.content,
          category_id: form.categoryId,
          model: form.model,
        })
        .eq("id", id)
        .select(`
          *,
          categories(name, slug)
        `)
        .single();

      if (error) throw error;

      // 更新本地状态
      const updatedPrompt = {
        id: data.id,
        title: data.title,
        content: data.content,
        categoryId: data.category_id,
        categoryName: data.categories?.name,
        categorySlug: data.categories?.slug,
        model: data.model,
        usageCount: data.usage_count,
        createdAt: data.created_at
      };

      setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p));
      setDetailPrompt(prev => prev?.id === id ? updatedPrompt : prev);
    } catch (error) {
      console.error("更新失败:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("确定要删除这个 Prompt 吗？")) return;

    try {
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPrompts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败: " + error.message);
    }
  };

  const handleImport = async (data) => {
    try {
      // 将分类名称映射到分类 ID
      const categoryMap = {};
      categories.forEach(cat => {
        categoryMap[cat.name] = cat.id;
      });

      // 准备批量插入数据
      const promptsToInsert = data.map(item => ({
        user_id: user.id,
        title: item.title,
        content: item.content,
        category_id: categoryMap[item.categoryName] || null,
        model: "通用",
        usage_count: 0
      }));

      // 批量插入
      const { data: insertedData, error } = await supabase
        .from("prompts")
        .insert(promptsToInsert)
        .select();

      if (error) throw error;

      // 刷新列表
      await fetchPrompts();

      return insertedData;
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
  const filtered = prompts.filter((p) => {
    // 分类过滤
    const matchCat = activeCategory === "all" || p.categorySlug === activeCategory;
    // 搜索过滤
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // 构建分类列表（包含"全部"）
  const allCategories = [
    { id: "all", slug: "all", name: "全部", count: prompts.length },
    ...categories.map(c => ({
      ...c,
      count: prompts.filter(p => p.categoryId === c.id).length
    }))
  ];

  const totalCount = prompts.reduce((a, p) => a + p.usageCount, 0);

  return (
    <div className="min-h-screen bg-gray-50" style={APP_FONT}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm shadow-blue-200">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.346A3.001 3.001 0 0012 15a3 3 0 00-2.99 2.757l-.347-.346z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">PromptBox</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新增
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              导入
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600">{user.name?.[0]?.toUpperCase() || "U"}</span>
              </div>
              <span className="text-xs text-gray-600 font-medium hidden sm:block">{user.name || user.email}</span>
              <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-1">
                退出
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-7">
        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all shadow-sm"
            placeholder="搜索提示词标题或内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
              <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
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
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${(activeCategory === "all" && cat.slug === "all") || activeCategory === cat.slug ? "bg-blue-400/50 text-white" : "bg-gray-100 text-gray-400"}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">共 <span className="font-semibold text-gray-600">{filtered.length}</span> 条提示词</p>
          <p className="text-xs text-gray-400">累计使用 <span className="font-semibold text-gray-600">{totalCount}</span> 次</p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm text-gray-400">加载中...</p>
          </div>
        ) : (
          /* Grid */
          filtered.length > 0 ? (
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
                <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">没有找到相关提示词</p>
              <button onClick={() => { setSearchQuery(""); setActiveCategory("all"); }} className="mt-2 text-xs text-blue-500 hover:text-blue-600">清除筛选</button>
            </div>
          )
        )}
      </div>

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
        />
      )}
      {detailPrompt && (
        <DetailModal
          prompt={detailPrompt}
          onClose={() => setDetailPrompt(null)}
          onCopy={(id) => { handleCopy(id); }}
          onUpdate={handleUpdate}
          categories={categories}
          models={MODELS}
        />
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (!user) return <AuthPage onLogin={setUser} />;
  return <MainApp user={user} onLogout={() => setUser(null)} />;
}
