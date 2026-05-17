---
title: "部署上线"
---

# 部署上线

本博客是纯前端项目，构建产物为静态文件，可以部署到任意静态托管平台。

## GitHub Pages（推荐）

### 前置条件

- 项目已推送到 GitHub 仓库
- 仓库已启用 GitHub Actions

### 步骤

#### 1. 创建 GitHub Actions 工作流

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm install

      - name: Generate content index
        run: npm run generate

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### 2. 配置 Vite 基础路径

如果是部署到 `https://用户名.github.io/仓库名/`（非根路径），需要修改 `vite.config.js`：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/仓库名/'  // 替换为你的仓库名
})
```

如果是部署到 `https://用户名.github.io/`（用户主页），则保持 `base: '/'`。

#### 3. 推送并触发部署

```bash
git add .
git commit -m "配置 GitHub Pages 部署"
git push origin main
```

推送后 GitHub Actions 会自动执行构建和部署。

#### 4. 启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 等待部署完成，访问显示的 URL

## Vercel

### 步骤

1. 在 [Vercel](https://vercel.com) 登录 GitHub 账号
2. 点击 "New Project"，导入博客仓库
3. 构建配置：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run generate && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. 点击 Deploy

Vercel 会在每次 push 到 main 分支时自动重新部署。

## Netlify

### 步骤

1. 在 [Netlify](https://netlify.com) 登录 GitHub 账号
2. 点击 "Add new site" → "Import an existing project"
3. 选择博客仓库
4. 构建配置：
   - **Build command**: `npm run generate && npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20
5. 点击 Deploy

## 手动部署

### 构建

```bash
npm run build
```

构建产物在 `dist/` 目录下。

### 部署到任意服务器

```bash
# 方式 1: rsync 同步
rsync -avz dist/ user@server:/var/www/blog/

# 方式 2: scp 上传
scp -r dist/* user@server:/var/www/blog/

# 方式 3: FTP 上传
# 使用 FileZilla 等工具上传 dist/ 目录下所有文件
```

### 部署到 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/blog;
    index index.html;

    # SPA 路由支持：所有路由都返回 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 自定义域名

### GitHub Pages

1. 进入仓库 Settings → Pages → Custom domain
2. 输入你的域名（如 `blog.example.com`）
3. 在域名 DNS 服务商添加 CNAME 记录指向 `用户名.github.io`

### Vercel / Netlify

在平台设置中添加自定义域名，按提示配置 DNS 记录。

## CDN 加速

对于国内访问，建议使用 CDN 加速：

1. **Cloudflare**：免费 CDN，配置 DNS 后自动生效
2. **腾讯云 CDN**：需要备案域名
3. **阿里云 CDN**：需要备案域名

## 部署检查清单

部署前确认：

- [ ] 所有 Markdown 文件 Front Matter 格式正确
- [ ] 运行 `npm run generate` 无报错
- [ ] 运行 `npm run build` 无报错
- [ ] 封面图片已放入 `content/covers/` 目录
- [ ] `vite.config.js` 的 `base` 路径正确
- [ ] 自定义域名 DNS 已配置（如需要）

## 部署后验证

- [ ] 首页正常加载，粒子动画正常显示
- [ ] 笔记列表页正常，标签过滤正常
- [ ] 笔记详情页正常，Markdown 渲染正常
- [ ] 项目列表和文档正常
- [ ] 读书列表和文档正常
- [ ] 百宝箱正常
- [ ] 移动端响应式正常
- [ ] 所有链接跳转正常
