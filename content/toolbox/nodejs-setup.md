---
title: "Node.js 环境配置指南"
---

# Node.js 环境配置指南

## 使用 nvm 管理多版本

```bash
# 安装 nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装指定版本
nvm install 18
nvm install 20

# 切换版本
nvm use 18
```

## 配置镜像源

```bash
# 使用淘宝镜像加速
npm config set registry https://registry.npmmirror.com

# 或使用 pnpm
pnpm config set registry https://registry.npmmirror.com
```

## 常用全局工具

```bash
npm i -g pnpm yarn nodemon ts-node
```
