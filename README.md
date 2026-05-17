# 云边小卖部

> 像走进云边镇的小卖部——外面是山风和晚霞，里面是整齐的货架和温暖的灯光。

一个基于 **Vite + Vue 3** 的静态 Markdown 个人博客。所有内容基于 Markdown 文件管理，无需后端数据库，零成本部署到 GitHub Pages 或任意静态托管平台。

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Vue 3 + Vite 6 |
| 路由 | Vue Router 4 |
| 渲染 | Markdown → marked + 自定义 Markdown 渲染器 |
| 图表 | Mermaid.js（流程图、时序图、架构图等） |
| 字体 | 霞鹜文楷（正文）+ JetBrains Mono（代码） |
| 评论 | Giscus（GitHub Discussions） |
| 构建输出 | 纯静态文件（`dist/`） |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 重新生成内容索引（添加/修改内容后必须执行）
npm run generate
```

## 内容管理

所有内容存放在 `content/` 目录下，使用 Markdown 管理。

### 目录结构

```
content/
├── notes/              # 技术笔记
│   └── *.md
├── projects/           # 项目文档
│   ├── sloth-boot/         # Sloth Boot - Spring Boot 脚手架
│   ├── smart-bookstore/    # BookStore 智慧书城 - 分布式秒杀案例
│   ├── cloud-edge-blog/    # 云边小卖部 - 本博客
│   ├── agent-forge/        # Agent Forge - AI Agent 编排框架
│   └── spider-nest/        # Spider Nest - Python 爬虫框架
├── books/              # 读书笔记
│   └── * /index.md + chapters
├── covers/             # 封面图片
├── site-config.json    # 站点配置
```

### 添加内容

```bash
# 添加一篇笔记
echo "---
title: '我的新文章'
date: 2026-05-17
tags: ['Vue', '前端']
---
# 正文开始" > content/notes/my-post.md

# 添加一个项目
mkdir content/projects/my-project
echo "---
name: '我的项目'
description: '项目简介'
tags: ['Python', '爬虫']
status: '规划中'
---" > content/projects/my-project/index.md

# 重新生成索引
npm run generate
```

### 封面图

封面图放在 `public/content/covers/` 目录，文件名与内容 slug 一致。
推荐设计尺寸见「内容管理指南」中的封面图设计规范章节。

| 卡片类型 | 设计稿尺寸 | 比例 |
|---------|-----------|------|
| 笔记卡片 | 720×344 px | 2.1:1 |
| 项目卡片 | 680×360 px | 1.9:1 |
| 读书卡片 | 232×336 px | 1:1.45 |

## 项目列表

| 项目 | 状态 | 说明 |
|------|------|------|
| Sloth Boot | 实验中 | Spring Boot 多模块企业级脚手架 |
| BookStore 智慧书城 | 开发中 | 分布式秒杀学习案例 |
| 云边小卖部 | 维护中 | 本博客 |
| Agent Forge | 规划中 | AI Agent 编排框架 |
| Spider Nest | 规划中 | Python 爬虫框架 |

## 构建部署

```bash
npm run build    # 生成 dist/ 目录
```

产出为纯静态文件，可直接部署到：
- GitHub Pages
- Cloudflare Pages
- Vercel / Netlify
- 任意 Nginx / S3 静态托管

## 项目架构

```
src/
├── App.vue                    # 根组件
├── main.js                    # 入口
├── router/index.js            # 路由配置
├── views/                     # 页面组件
│   ├── Home.vue
│   ├── Notes.vue              # 笔记列表
│   ├── NoteDetail.vue         # 笔记详情
│   ├── Projects.vue           # 项目列表
│   ├── DocReader.vue          # 项目/书籍文档阅读器
│   ├── Books.vue              # 读书列表
│   ├── PdfReader.vue          # PDF 阅读器
│   ├── Toolbox.vue            # 百宝箱
│   ├── ToolboxDoc.vue         # 命令文档
│   └── About.vue              # 关于
├── components/                # 通用组件
│   ├── Navbar.vue
│   ├── SiteFooter.vue
│   ├── NoteCard.vue           # 笔记卡片
│   ├── ProjectCard.vue        # 项目卡片
│   ├── BookCard.vue           # 读书卡片
│   ├── MarkdownRenderer.vue   # Markdown 渲染
│   ├── SideNav.vue            # 侧边导航
│   ├── TableOfContents.vue    # 目录
│   ├── SearchModal.vue        # 搜索
│   └── ...
├── composables/               # 组合式函数
│   ├── useContentLoader.js    # 内容加载
│   └── useMarkdown.js         # Markdown 渲染
├── styles/                    # 样式
│   ├── variables.css          # CSS 变量（设计令牌）
│   ├── global.css             # 全局样式
│   └── markdown.css           # Markdown 渲染样式
└── utils/                     # 工具函数
    ├── publicPath.js
    └── frontmatter.js
```

## License

MIT
