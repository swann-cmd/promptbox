import { useState } from "react";
import { CloseIcon } from "../ui/icons";
import { sanitizeInput } from "../../utils/sanitize";
import { updateUserProfile } from "../../utils/community";
import UserAvatar from "./UserAvatar";

/**
 * 验证 URL 格式是否有效
 */
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

/**
 * User Profile Edit Modal Component
 */
function UserProfileModal({ user, onClose, onUpdate, onError }) {
  const [form, setForm] = useState({
    displayName: user.display_name || "",
    bio: user.bio || "",
    avatarUrl: user.avatar_url || ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validation
    const sanitizedDisplayName = sanitizeInput(form.displayName.trim(), 50);
    const sanitizedBio = sanitizeInput(form.bio.trim(), 500);
    const sanitizedAvatarUrl = form.avatarUrl.trim() ? sanitizeInput(form.avatarUrl.trim(), 500) : null;

    if (!sanitizedDisplayName) {
      onError("保存失败", "昵称不能为空");
      return;
    }

    // Optional: Basic URL validation for avatar
    if (sanitizedAvatarUrl && !isValidUrl(sanitizedAvatarUrl)) {
      onError("保存失败", "头像链接格式不正确");
      return;
    }

    setSubmitting(true);
    try {
      const updatedProfile = await updateUserProfile({
        displayName: sanitizedDisplayName,
        bio: sanitizedBio || null,
        avatarUrl: sanitizedAvatarUrl,
      });

      if (onUpdate) {
        onUpdate(updatedProfile);
      }
      onClose();
    } catch (error) {
      console.error("更新用户档案失败:", error);
      onError("保存失败", error.message || "更新失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const displayNameCount = form.displayName.length;
  const bioCount = form.bio.length;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">编辑个人资料</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {/* Display Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              昵称 <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="输入你的昵称"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              maxLength={50}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${displayNameCount > 50 ? 'text-red-400' : 'text-gray-400'}`}>
                {displayNameCount}/50
              </span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              个人简介 <span className="text-gray-400 font-normal">(可选)</span>
            </label>
            <textarea
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
              placeholder="介绍一下自己..."
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              maxLength={500}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${bioCount > 500 ? 'text-red-400' : 'text-gray-400'}`}>
                {bioCount}/500
              </span>
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              头像链接 <span className="text-gray-400 font-normal">(可选)</span>
            </label>
            <input
              type="url"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              placeholder="https://example.com/avatar.jpg"
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
            />
            <p className="text-xs text-gray-400 mt-1">
              请输入有效的图片链接
            </p>
          </div>

          {/* Avatar Preview */}
          {form.avatarUrl && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <UserAvatar
                src={form.avatarUrl}
                alt={form.displayName || "预览"}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">头像预览</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-2 border-t border-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.displayName.trim()}
              className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-blue-200"
            >
              {submitting ? "保存中..." : "保存更改"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
