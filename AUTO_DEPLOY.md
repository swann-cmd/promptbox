# 🔄 设置自动部署（Git 推送自动触发）

## 当前状态
- ❌ 项目尚未连接到 Vercel
- ✅ 已有 `vercel.json` 配置文件
- ✅ 代码已推送到 GitHub

---

## 🚀 设置自动部署（只需操作一次）

### 第 1 步：在 Vercel 导入项目

1. 访问 **https://vercel.com/new**
2. 点击 **"Import Git Repository"**
3. 选择 **GitHub**
4. 搜索并导入：`swann-cmd/promptbox`
5. Vercel 会自动检测配置

### 第 2 步：配置自动部署

导入后，Vercel 会自动：
- ✅ 设置 GitHub webhook
- ✅ 连接 `main` 分支到生产环境
- ✅ 每次推送到 `main` 自动触发部署

### 第 3 步：完成！

以后每次你执行：
```bash
git add .
git commit -m "your message"
git push
```

Vercel 会**自动检测推送并部署**！

---

## 🎯 首次部署

现在需要手动触发第一次部署：

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

## ✅ 设置后的效果

第一次设置后，您的工作流会变成：

```bash
# 1. 修改代码
vim src/App.jsx

# 2. 提交更改
git add .
git commit -m "更新功能"

# 3. 推送到 GitHub
git push

# ✅ Vercel 自动检测并部署！
# 几分钟后，访问您的 Vercel URL 即可看到更新
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

**现在需要做的：**
1. 访问 https://vercel.com/new
2. 导入 `swann-cmd/promptbox`
3. 点击 Deploy

**以后每次推送都会自动部署！** 🚀
