#!/bin/bash

# PromptBox 部署到 Vercel 生产环境

echo "🚀 PromptBox 部署脚本"
echo "======================"
echo ""

# 检查是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改"
    echo "请先提交所有更改："
    echo "  git add ."
    echo "  git commit -m 'your message'"
    echo "  git push"
    echo ""
    exit 1
fi

echo "✅ 工作目录干净"
echo ""

# 显示当前分支
BRANCH=$(git branch --show-current)
echo "📍 当前分支: $BRANCH"
echo ""

# 确认部署
read -p "确认部署到 Vercel 生产环境？(y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 部署已取消"
    exit 1
fi

echo ""
echo "🔨 开始构建..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "✅ 构建成功"
echo ""
echo "📦 部署到 Vercel..."
echo ""

# 使用 Vercel CLI 部署
npx vercel --prod

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 您的应用现在应该已上线："
echo "   https://promptbox-yourname.vercel.app"
echo ""
