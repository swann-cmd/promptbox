# 开发工作流指南

## 🎯 分支策略

```
main (生产环境)
  ↑ 只合并经过测试的功能分支

feature/xxx (功能分支)
  ↑ 开发新功能，推送到 GitHub 后 Vercel 自动创建预览部署
```

## 📝 常用命令

### Git 别名快捷命令

| 别名 | 原命令 | 说明 |
|------|--------|------|
| `git co <branch>` | `git checkout` | 切换分支 |
| `git br` | `git branch` | 查看分支 |
| `git st` | `git status` | 查看状态 |
| `git ci` | `git commit` | 提交 |
| `git last` | `git log -1 HEAD` | 查看最后一次提交 |

### 工作流专用命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `git feature <name>` | 创建并切换到新功能分支 | `git feature edit-button` |
| `git push-feature <name>` | 推送功能分支到远程 | `git push-feature edit-button` |
| `git finish <name>` | 合并功能分支到 main 并删除 | `git finish edit-button` |

## 🔄 完整开发流程

### 1. 开始新功能

```bash
# 创建功能分支
git feature add-export

# 开发...
git add .
git ci -m "Add export functionality"

# 推送到 GitHub（触发 Vercel 预览部署）
git push-feature add-export
```

### 2. 测试预览版本

- 在 Vercel Dashboard 找到对应的预览部署
- 访问预览 URL 测试功能
- 类似：`https://promptbox-feature-add-export-xxx.vercel.app`

### 3. 完成功能（合并到 main）

```bash
# 切换到 main 分支
git co main

# 拉取最新代码
git pull

# 合并功能分支（会自动删除功能分支）
git finish add-export

# 推送到生产环境
git push
```

## ⚠️ 注意事项

1. **main 分支保护**
   - 不要直接在 main 分支开发新功能
   - main 分支的代码应该是稳定的

2. **功能分支命名**
   - 使用清晰的小写英文名称
   - 例如：`feature/add-export`、`feature/edit-modal`

3. **提交信息**
   - 使用清晰的提交信息
   - 例如：`Add export functionality` 而不是 `update`

4. **测试**
   - 在预览环境充分测试后再合并到 main
   - 确保不会破坏现有功能

## 🔧 紧急情况

### 如果发现生产环境有 bug

```bash
# 方法1: 回滚到上一个稳定版本
git revert HEAD
git push

# 方法2: 在 Vercel Dashboard 中
# Deployments → 找到稳定版本 → 点击 "Promote to Production"
```

### 如果需要修复紧急 bug

```bash
# 创建 hotfix 分支
git checkout -b hotfix/urgent-bug-fix

# 修复并推送
git add .
git ci -m "Fix critical bug"
git push origin hotfix/urgent-bug-fix

# 快速合并到 main
git checkout main
git merge hotfix/urgent-bug-fix
git push
```

## 📚 参考资源

- [Vercel 预览部署文档](https://vercel.com/docs/deployments/preview-deployments)
- [Git 分支最佳实践](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
