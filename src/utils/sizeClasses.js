/**
 * Size classes utility for consistent sizing across components
 * Provides standardized size mappings for buttons, avatars, and other UI elements
 */

/**
 * Size classes for UserAvatar component
 * Maps size prop to width, height, and text size classes
 */
export const avatarSizeClasses = {
  sm: "w-6 h-6 text-xs",      // 24px
  md: "w-8 h-8 text-sm",      // 32px
  lg: "w-12 h-12 text-base",  // 48px
};

/**
 * Size classes for ToggleButton component
 * Maps size prop to container and padding classes
 */
export const toggleButtonSizeClasses = {
  sm: "w-7 h-7 text-xs",
  sm_padding: "px-2 py-1 text-xs gap-1",
  md: "w-8 h-8 text-sm",
  md_padding: "px-2.5 py-1.5 text-xs gap-1.5",
  lg: "w-9 h-9 text-base",
  lg_padding: "px-3 py-1.5 text-sm gap-1.5"
};

/**
 * Get size class with fallback to default
 * @param {Object} classes - Size classes object
 * @param {string} size - Requested size
 * @param {string} defaultSize - Default size to use if requested size not found
 * @returns {string} - Tailwind CSS classes
 */
export function getSizeClass(classes, size, defaultSize = "md") {
  return classes[size] || classes[defaultSize];
}

/**
 * Get toggle button classes (container + padding)
 * @param {string} size - Size variant
 * @returns {Object} - Object with container and padding classes
 */
export function getToggleButtonClasses(size = "md") {
  const containerSize = size === "sm" || size === "md" || size === "lg" ? size : "md";
  return {
    container: toggleButtonSizeClasses[containerSize],
    padding: toggleButtonSizeClasses[`${containerSize}_padding`]
  };
}
