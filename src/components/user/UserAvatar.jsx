import { memo, useState } from "react";
import { UserIcon } from "../ui/icons";

/**
 * User Avatar Component
 * Displays user avatar image or fallback to initials/icon
 */
const UserAvatar = memo(({ src, alt, size = "md" }) => {
  const [imageError, setImageError] = useState(false);

  // Size classes mapping
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",      // 24px
    md: "w-8 h-8 text-sm",      // 32px
    lg: "w-12 h-12 text-base",  // 48px
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Get first letter of display name for fallback
  const getInitial = () => {
    if (!alt) return "?";
    // For Chinese or English names, take the first character
    return alt.charAt(0).toUpperCase();
  };

  // If avatar URL exists and hasn't errored, display the image
  if (src && !imageError) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-100 flex-shrink-0`}>
        <img
          src={src}
          alt={alt || "User avatar"}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback: display initials or user icon
  return (
    <div className={`${sizeClass} rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0`}>
      {alt ? (
        <span className="font-semibold text-blue-600">
          {getInitial()}
        </span>
      ) : (
        <UserIcon />
      )}
    </div>
  );
});

UserAvatar.displayName = "UserAvatar";

export default UserAvatar;
