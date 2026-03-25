/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',  // 启用基于 class 的暗黑模式
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',        // 深色背景
          bgSecondary: '#1e293b',  // 次级背景
          text: '#f1f5f9',      // 主文字
          textSecondary: '#94a3b8',  // 次级文字
          border: '#334155',    // 边框
        }
      }
    },
  },
  plugins: [],
}
