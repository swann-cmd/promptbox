import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { DEFAULT_CATEGORIES } from "../../constants/categories";
import { RATE_LIMIT_MS } from "../../constants/app";
import { LogoIcon, CommunityIcon } from "../ui/icons";

/**
 * 认证页面组件 - 处理登录和注册
 */
function AuthPage({ onLogin, onShowCommunity }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);

  const handleSubmit = async () => {
    // 速率限制检查
    const now = Date.now();
    if (now - lastAttemptTime < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastAttemptTime)) / 1000);
      setError(`请等待 ${waitTime} 秒后重试`);
      return;
    }

    setError("");
    if (!form.email || !form.password) {
      setError("请填写完整信息");
      return;
    }

    if (tab === "register") {
      if (form.password !== form.confirmPassword) {
        setError("两次密码不一致");
        return;
      }
      if (form.password.length < 6) {
        setError("密码至少 6 位");
        return;
      }
    }

    setLastAttemptTime(now);
    setLoading(true);

    try {
      if (tab === "register") {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch (err) {
      setError(err.message || "操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name || form.email.split("@")[0] }
      }
    });

    if (signUpError) throw signUpError;

    if (data.user) {
      try {
        // 创建默认分类
        await createDefaultCategories(data.user.id);

        // 创建默认用户档案
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            display_name: form.name || data.user.email.split('@')[0]
          });

        if (profileError) {
          console.warn("创建用户档案时出错:", profileError);
        }
      } catch (err) {
        console.warn("创建用户数据时出错，但不影响登录:", err);
      }
      onLogin({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || form.email.split("@")[0]
      });
    }
  };

  const handleLogin = async () => {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    });

    if (signInError) throw signInError;

    if (data.user) {
      onLogin({
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || form.email.split("@")[0]
      });
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

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setError("");
    setForm({ email: "", password: "", confirmPassword: "", name: "" });
  };

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-100 dark:bg-violet-900/20 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <LogoIcon />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-dark-text tracking-tight">PromptBox</h1>
          <p className="text-sm text-gray-400 dark:text-dark-textSecondary mt-1">你的 AI 提示词库</p>
        </div>

        {/* Community Entry Button */}
        <div className="absolute top-0 right-0">
          <button
            onClick={onShowCommunity}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-purple-200"
            title="社区广场"
          >
            <CommunityIcon />
            <span>社区</span>
          </button>
        </div>

        {/* Card */}
        <div
          className="bg-white dark:bg-dark-bgSecondary rounded-3xl shadow-xl shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-dark-border p-6"
          style={{ minHeight: 420 }}
        >
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-dark-bg rounded-xl p-1 mb-6">
            {[{ id: "login", label: "登录" }, { id: "register", label: "注册" }].map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === t.id
                    ? "bg-white dark:bg-dark-bgSecondary text-gray-900 dark:text-dark-text shadow-sm"
                    : "text-gray-500 dark:text-dark-textSecondary hover:text-gray-700 dark:hover:text-dark-text"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* All fields */}
          <div className="space-y-3.5">
            {/* 姓名 - register only */}
            <div
              style={{
                overflow: "hidden",
                maxHeight: tab === "register" ? 80 : 0,
                opacity: tab === "register" ? 1 : 0,
                transition: "max-height 0.25s ease, opacity 0.2s ease"
              }}
            >
              <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">姓名</label>
              <input
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-900 dark:text-dark-text bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="你的名字"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                tabIndex={tab === "register" ? 0 : -1}
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">邮箱</label>
              <input
                type="email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-900 dark:text-dark-text bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">密码</label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-900 dark:text-dark-text bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* 确认密码 - register only */}
            <div
              style={{
                overflow: "hidden",
                maxHeight: tab === "register" ? 80 : 0,
                opacity: tab === "register" ? 1 : 0,
                transition: "max-height 0.25s ease, opacity 0.2s ease"
              }}
            >
              <label className="text-xs font-medium text-gray-500 dark:text-dark-textSecondary block mb-1.5">确认密码</label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm text-gray-900 dark:text-dark-text bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                tabIndex={tab === "register" ? 0 : -1}
              />
            </div>
          </div>

          {/* Error */}
          <div
            style={{
              overflow: "hidden",
              maxHeight: error ? 60 : 0,
              opacity: error ? 1 : 0,
              transition: "max-height 0.2s ease, opacity 0.15s ease"
            }}
          >
            <div className="mt-3.5 px-3.5 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center gap-2">
              <svg
                className="w-4 h-4 text-red-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
              </svg>
              <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-5 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-blue-700"
          >
            {loading ? "处理中..." : tab === "login" ? "登录" : "创建账号"}
          </button>

          {/* 忘记密码 - login only */}
          <div
            style={{
              overflow: "hidden",
              maxHeight: tab === "login" ? 40 : 0,
              opacity: tab === "login" ? 1 : 0,
              transition: "max-height 0.2s ease, opacity 0.15s ease"
            }}
          >
            <button className="w-full mt-3 text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-center">
              忘记密码？
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-dark-textSecondary mt-6">
          继续即表示同意 <span className="text-blue-500 dark:text-blue-400 cursor-pointer">服务条款</span> 和{" "}
          <span className="text-blue-500 dark:text-blue-400 cursor-pointer">隐私政策</span>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
