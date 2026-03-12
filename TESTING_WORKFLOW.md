# 本地测试环境工作流

## 🎯 目的

避免每次修改都推送到 Vercel 生产环境，使用本地测试环境进行快速验证。

## 📦 初始设置

### 首次配置（只需一次）

```bash
# 运行配置脚本
./setup-test-env.sh
```

这会：
- 创建 `.githooks` 目录
- 配置 git hooks
- 设置自动提醒

## 🚀 日常使用流程

### 标准工作流

1. **修改代码**
   ```bash
   # 编辑代码...
   ```

2. **提交到 git**
   ```bash
   git add .
   git commit -m "描述你的修改"
   ```

3. **启动测试环境**
   ```bash
   npm run test-env
   ```

4. **打开浏览器测试**
   ```
   http://localhost:5173
   ```

5. **验证功能**
   - 测试修改的功能
   - 检查控制台是否有错误
   - 确认一切正常

6. **停止测试环境**
   ```bash
   # 按 Ctrl+C 停止
   ```

7. **推送到远程（测试通过后）**
   ```bash
   git push origin main
   ```

## 📋 当前测试重点

### ✅ 已修复
- [x] CommunityPage 函数定义顺序错误
- [x] 社区广场正常打开

### 🧪 待测试
- [ ] UserProfilePage（用户主页）
- [ ] UserProfileModal（编辑档案）
- [ ] 用户档案创建和加载
- [ ] 社区提示词点赞、收藏功能
- [ ] 提示词复制功能

## 🔧 故障排除

### 端口被占用
```bash
# 查找并停止占用 5173 端口的进程
lsof -ti:5173 | xargs kill -9
```

### 清理缓存
```bash
# 清理 node_modules 和构建
rm -rf node_modules dist
npm install
npm run build
```

### 查看测试日志
```bash
# 如果使用后台模式
tail -f test-env.log
```

## 💡 最佳实践

1. **小步快跑**
   - 每次只修改一个功能点
   - 立即提交并测试
   - 避免大量未测试的修改

2. **测试清单**
   - 修改的功能是否正常？
   - 是否有控制台错误？
   - 是否影响了其他功能？

3. **提交信息**
   - 使用清晰的提交信息
   - 说明修改了什么
   - 说明为什么修改

4. **推送前确认**
   - 本地测试通过
   - 代码已提交
   - 没有待处理的修改

## 🎬 生产部署

本地测试通过后，推送到 GitHub 会自动触发 Vercel 部署：

```bash
git push origin main
```

等待 Vercel 部署完成（约 1-2 分钟），然后在生产环境验证。

---

**快速命令参考：**
```bash
npm run test-env          # 启动测试环境
npm run build             # 构建项目
npm run dev               # 开发模式
npm run preview           # 预览生产构建
```
