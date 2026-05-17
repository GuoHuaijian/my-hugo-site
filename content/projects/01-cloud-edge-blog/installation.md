---
title: "安装与开发"
---

# 安装与开发

## 环境要求

| 依赖 | 最低版本 | 推荐版本 |
|------|----------|----------|
| Node.js | 18.0 | 20.x LTS |
| npm | 9.0 | 10.x |
| Git | 2.30 | 最新 |

检查环境：

```bash
node -v   # 应输出 v18.x 或更高
npm -v    # 应输出 9.x 或更高
git --version
```

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/你的用户名/cloud-edge-blog.git
cd cloud-edge-blog
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

启动后访问 `http://localhost:5173` 即可看到博客首页。

开发服务器支持热重载，修改 `content/` 下的 Markdown 文件后：
1. 重新运行 `npm run generate` 刷新内容索引
2. 页面自动更新

> **提示**：`npm run dev` 已自动包含 `generate` 步骤，首次启动会自动生成索引。

## 开发工作流

### 添加新内容

```bash
# 1. 编辑 content/ 下的 Markdown 文件
# 2. 重新生成索引
npm run generate
# 3. 开发服务器自动刷新
```

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录，可直接部署到任意静态托管平台。

### 本地预览构建结果

```bash
npm run preview
```

## 开发服务器说明

开发服务器基于 Vite，具备以下特性：

- **热模块替换（HMR）**：修改 Vue 组件即时更新，无需刷新页面
- **按需编译**：仅编译访问到的路由对应代码
- **自动端口切换**：默认端口被占用时自动尝试下一个端口

### 端口配置

如需固定端口，修改 `package.json` 中的 dev 脚本：

```json
{
  "scripts": {
    "dev": "npm run generate && vite --host 0.0.0.0 --port 3000"
  }
}
```

## 常见问题

### Q: 修改 Markdown 后页面没更新？

运行 `npm run generate` 重新生成内容索引。开发服务器不会自动监听 `content/` 目录变化。

### Q: 封面图片不显示？

确保图片放在 `content/covers/` 目录下，文件名与 slug 一致（支持 `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg` 格式）。

### Q: 开发服务器启动慢？

首次启动需要编译所有依赖，后续启动会利用缓存显著加快。
