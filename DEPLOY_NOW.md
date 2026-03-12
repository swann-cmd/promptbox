# 🚀 PromptBox 部署指南 - 立即上线

## 🎯 推送到 GitHub 自动部署到 Vercel（推荐）

### 📌 工作流程说明

**一次性设置（首次部署）：**
1. 访问 Vercel 并导入项目
2. Vercel 自动设置 GitHub webhook
3. 完成首次部署

**之后每次更新：**
```bash
git add .
git commit -m "更新功能"
git push origin main
# ✅ Vercel 自动检测到推送并部署
```

---

### 第 1 步：访问 Vercel（一次性设置）

点击下面的链接打开部署页面：

```
👉 https://vercel.com/new
```

或者直接访问 `vercel.com` 然后点击 "New Project"

---

### 第 2 步：导入 GitHub 仓库

1. 在 Vercel 页面上，你会看到 **"Import Git Repository"**
2. 点击下方的 **"GitHub"** 图标
3. 如果是第一次使用，需要授权 Vercel 访问你的 GitHub
4. 在搜索框中输入：`swann-cmd/promptbox`
5. 找到仓库后，点击 **"Import"**

---

### 第 3 步：配置项目（自动完成）

Vercel 会自动检测并配置：

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

✅ 这些都是正确的，**不需要修改**

---

### 第 4 步：环境变量（可选）

如果使用 Supabase，点击 **"Environment Variables"** 添加：

```bash
VITE_SUPABASE_URL = your-supabase-url
VITE_SUPABASE_ANON_KEY = your-supabase-key
```

**注意**：如果不需要 Supabase，可以跳过这一步。

---

### 第 5 步：部署！

1. 点击页面底部的 **"Deploy"** 按钮
2. 等待 2-3 分钟...
3. 看到 **"Congratulations!"** 页面
4. 点击提供的链接访问你的应用 ✅

---

## 📱 部署后的 URL

部署成功后，你会得到一个类似这样的 URL：

```
https://promptbox-abc123.vercel.app
```

这就是你的线上应用地址！

---

## 🔄 更新部署（自动）

**每次推送到 GitHub，Vercel 会自动部署！**

```bash
# 本地开发完成后
git add .
git commit -m "添加新功能"
git push origin main

# ✅ Vercel 自动检测推送并部署
# 📱 2-3 分钟后访问新版本
```

**查看部署状态：**
- 访问 Vercel 项目仪表板
- 查看 "Deployments" 标签
- 实时查看构建进度和日志

**如需手动重新部署：**
1. 访问 Vercel 项目页面
2. 点击 **"Redeploy"**
3. 选择 **"Production"**
4. 点击 **"Redeploy"**

---

## 🎊 部署成功检查清单

部署完成后，访问你的 URL 并检查：

- [ ] 首页正常加载
- [ ] 可以添加提示词
- [ ] 可以搜索提示词
- [ ] 社区功能正常
- [ ] 移动端显示正常
- [ ] 浏览器控制台无错误

---

## ❓ 常见问题

### Q: 部署失败？
A: 检查：
1. 构建命令是否正确（`npm run build`）
2. 依赖是否完整（`node_modules`）
3. Node.js 版本（建议 18.x 或更高）

### Q: 页面空白？
A: 检查：
1. 浏览器控制台错误
2. 环境变量是否配置
3. 构建日志是否有错误

### Q: 如何设置自定义域名？
A:
1. 进入项目设置
2. 点击 "Domains"
3. 添加你的域名

---

## 🎉 完成！

恭喜！你的 PromptBox 应用现在已经上线了！

🌐 分享你的应用链接给朋友吧！

---

*如有问题，请查看 Vercel 文档：https://vercel.com/docs*
