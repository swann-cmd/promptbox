# 🔄 推送到 GitHub 自动部署到 Vercel

## 当前状态
- ❌ 项目尚未连接到 Vercel
- ✅ 已有 `vercel.json` 配置文件
- ✅ 代码已推送到 GitHub

---

## 🚀 工作流程说明

### 一次性设置（仅需一次）
在 Vercel 导入项目，Vercel 自动配置 GitHub webhook

### 之后每次更新
```bash
git push origin main
# ✅ Vercel 自动检测并部署
```

---

## 📋 详细设置步骤

### 第 1 步：在 Vercel 导入项目

1. 访问 **https://vercel.com/new**
2. 点击 **"Import Git Repository"**
3. 选择 **GitHub**
4. 搜索并导入：`swann-cmd/promptbox`
5. Vercel 会自动检测配置

### 第 2 步：Vercel 自动配置（无需手动操作）

导入后，Vercel 会自动：
- ✅ 设置 GitHub webhook
- ✅ 连接 `main` 分支到生产环境
- ✅ 每次推送到 `main` 自动触发部署

### 第 3 步：完成自动部署设置！

以后每次你执行：
```bash
git add .
git commit -m "your message"
git push
```

Vercel 会**自动检测推送并部署**！

---

## 🎯 首次部署（一次性操作）

现在需要手动触发第一次部署以启用自动部署：

### 方式 A：通过 Vercel 网站

1. 访问 **https://vercel.com/new**
2. 导入 `swann-cmd/promptbox`
3. 点击 **"Deploy"**

### 方式 B：通过命令行

```bash
npx vercel login
npx vercel --prod
```

---

## ✅ 设置完成后的工作流

完成一次性设置后，您的工作流变成：

```bash
# 1. 修改代码
vim src/App.jsx

# 2. 提交更改
git add .
git commit -m "更新功能"

# 3. 推送到 GitHub
git push origin main

# ✅ Vercel 自动检测并部署！
# 📱 2-3 分钟后访问您的 Vercel URL 即可看到更新
```

---

## 📱 查看部署状态

部署后，您可以：
- 访问 Vercel 项目面板查看部署状态
- 实时查看部署日志
- 查看预览 URL
- 配置自定义域名

---

## 🎉 总结

### 现在需要做的（一次性操作）：
1. 访问 https://vercel.com/new
2. 导入 `swann-cmd/promptbox`
3. 点击 Deploy

### 之后每次更新（自动部署）：
```bash
git push origin main
# ✅ 自动部署到 Vercel！
```

**推送到 GitHub → 自动部署到 Vercel！** 🚀
