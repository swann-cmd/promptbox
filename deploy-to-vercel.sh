#!/bin/bash
set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           🚀 PromptBox 部署到 Vercel 生产环境                 ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 检查工作目录
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  检测到未提交的更改"
    echo ""
    echo "请先提交所有更改："
    echo "  git add ."
    echo "  git commit -m 'your message'"
    echo "  git push"
    echo ""
    exit 1
fi

echo "✅ Git 工作目录干净"
echo ""

# 构建项目
echo "🔨 步骤 1/4: 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误"
    exit 1
fi

echo "✅ 构建成功"
echo ""

# 检查 Vercel CLI
echo "🔍 步骤 2/4: 检查 Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI 未安装，使用 npx..."
    VERCEL_CMD="npx vercel"
else
    echo "✅ Vercel CLI 已安装"
    VERCEL_CMD="vercel"
fi
echo ""

# 登录检查
echo "🔐 步骤 3/4: 检查登录状态..."
$VERCEL_CMD whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo ""
    echo "📝 需要登录 Vercel..."
    echo ""
    echo "请在打开的浏览器中完成登录"
    echo "----------------------------------------"
    $VERCEL_CMD login

    if [ $? -ne 0 ]; then
        echo "❌ 登录失败"
        exit 1
    fi
else
    echo "✅ 已登录 Vercel"
fi
echo ""

# 部署
echo "🚀 步骤 4/4: 部署到生产环境..."
echo ""
echo "这可能需要 2-3 分钟，请耐心等待..."
echo ""

$VERCEL_CMD --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              🎉 部署成功！PromptBox 已上线！                ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🌐 您的应用现在可以通过以下地址访问："
    echo ""
    $VERCEL_CMD ls
    echo ""
    echo "📱 欢迎使用 PromptBox！"
    echo ""
else
    echo ""
    echo "❌ 部署失败，请检查错误信息"
    exit 1
fi
