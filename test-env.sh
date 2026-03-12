#!/bin/bash

# 本地测试环境部署脚本
# 功能：在代码提交后自动启动本地测试服务器

set -e

echo "🚀 启动本地测试环境..."

# 检查端口是否被占用
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 5173 已被占用，尝试停止旧进程..."
    kill -9 $(lsof -t -i:5173) 2>/dev/null || true
    sleep 1
fi

# 清理旧的构建
echo "🧹 清理旧构建..."
rm -rf dist

# 构建项目
echo "📦 构建项目..."
npm run build

# 启动开发服务器
echo "🌐 启动开发服务器 (http://localhost:5173)..."
npm run dev

# 如果需要使用 preview 模式（生产构建预览）:
# echo "🌐 启动预览服务器 (http://localhost:4173)..."
# npm run preview -- --host 0.0.0.0 --port 4173
