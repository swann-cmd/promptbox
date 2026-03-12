#!/bin/bash

# 配置本地测试环境
# 使用方法: ./setup-test-env.sh

echo "🔧 配置本地测试环境..."

# 创建 .githooks 目录（可以提交到 git）
mkdir -p .githooks

# 创建 post-commit hook
cat > .githooks/post-commit << 'EOF'
#!/bin/bash
# Git post-commit hook - 自动启动测试环境

echo "📝 代码已提交"
echo "💡 启动测试环境请运行: npm run test-env"
echo "🌐 测试地址: http://localhost:5173"
EOF

chmod +x .githooks/post-commit

# 配置 git 使用 .githooks 目录
git config core.hooksPath .githooks

echo "✅ 测试环境配置完成！"
echo ""
echo "📋 使用方法："
echo "   1. 修改代码并提交到 git"
echo "   2. 运行 'npm run test-env' 启动测试环境"
echo "   3. 访问 http://localhost:5173 测试"
echo ""
echo "💡 提示：你也可以手动运行 ./test-env.sh"
