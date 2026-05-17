---
title: Git 常用命令速查
---

## 基础操作

```bash
# 克隆仓库
git clone <url>

# 查看状态
git status

# 添加文件
git add .
git add <file>

# 提交
git commit -m "feat: 添加新功能"
git commit -am "fix: 修复 bug"

# 推送
git push origin main
git push -u origin <branch>
```

## 分支管理

```bash
# 查看分支
git branch
git branch -a

# 创建并切换
git checkout -b feature/new-feature

# 切换分支
git checkout main

# 合并分支
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

## 回退与撤销

```bash
# 撤销工作区修改
git checkout -- <file>
git restore <file>

# 撤销暂存
git reset HEAD <file>
git restore --staged <file>

# 撤销提交（保留修改）
git reset --soft HEAD~1

# 撤销提交（丢弃修改）
git reset --hard HEAD~1

# 回退到指定版本
git reset --hard <commit-hash>
```

## 变基与整理

```bash
# 变基
git rebase main

# 交互式变基（合并提交）
git rebase -i HEAD~3

# 修改最近一次提交
git commit --amend

# 储藏修改
git stash
git stash pop
```

## 标签

```bash
# 创建标签
git tag v1.0.0
git tag -a v1.0.0 -m "版本 1.0.0"

# 推送标签
git push origin v1.0.0
git push origin --tags
```

## 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```
