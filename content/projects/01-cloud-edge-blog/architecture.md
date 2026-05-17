---
title: "架构设计"
---

# 架构设计

## 整体架构

云边小卖部采用**纯前端静态博客架构**，无后端服务，所有内容通过 Markdown 文件管理。

```
┌─────────────────────────────────────────────────┐
│                    用户浏览器                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐    ┌──────────────────────┐    │
│  │  Vue 3 SPA   │    │  静态资源 (Vite)      │    │
│  │  (路由+组件)  │◄──►│  - JS Bundle         │    │
│  │             │    │  - CSS Styles         │    │
│  └──────┬──────┘    │  - Fonts              │    │
│         │           └──────────────────────┘    │
│         │                                       │
│         ▼                                       │
│  ┌─────────────────────────────────────┐        │
│  │       useContentLoader               │        │
│  │  ┌──────────────┐ ┌───────────────┐  │        │
│  │  │ content-index │ │ Markdown 文件 │  │        │
│  │  │    .json      │ │   .md (按需)  │  │        │
│  │  └──────────────┘ └───────────────┘  │        │
│  └─────────────────────────────────────┘        │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 核心设计决策

### 为什么不用 SSG/SSR？

传统静态站点生成器（如 VitePress、Hexo）在构建时渲染所有页面。本博客选择 **CSR（客户端渲染）+ 按需加载** 方案：

| 方案 | 优点 | 缺点 |
|------|------|------|
| SSG（VitePress） | SEO 友好，首屏快 | 构建慢，每篇文章都要编译 |
| SSR（Nuxt） | SEO 最佳，首屏快 | 需要 Node.js 服务器 |
| **CSR + 按需加载** | **构建极快，内容即写即发** | SEO 较弱（可通过 prerender 弥补） |

对于个人博客，内容量通常在百篇以内，CSR 方案的优势明显：
- 添加新文章 = 放一个 `.md` 文件，无需重新构建
- 构建产物小，部署快
- 开发体验好，修改即时生效

### 内容索引策略

```
构建时（generate-index.js）
├── 扫描 content/ 目录
├── 解析所有 Markdown 的 Front Matter
├── 生成 content-index.json（元数据索引）
└── 复制 content/ 到 public/content/（原始文件）

运行时（浏览器）
├── 首次加载 content-index.json（~10-50KB）
├── 列表页直接从索引渲染
└── 详情页按需 fetch 对应 .md 文件
```

这种策略的核心优势：
1. **列表页零等待**：索引 JSON 通常只有几十 KB
2. **详情页按需加载**：只有用户点击文章才加载对应 Markdown
3. **内容更新简单**：只需添加/修改 `.md` 文件，无需重新构建

## 数据流

### 内容加载流程

```
用户访问 /notes
    │
    ▼
Notes.vue 挂载
    │
    ▼
useContentLoader.loadIndex()
    │
    ├── 已有索引？ → 直接返回
    ├── 正在加载？ → 等待已有 Promise（防并发）
    └── 首次加载 → fetch('/content/content-index.json')
    │
    ▼
解析 JSON → 存入 Vue ref（响应式）
    │
    ▼
Notes.vue 渲染笔记列表
    │
    ▼
用户点击某篇笔记
    │
    ▼
路由跳转到 /notes/:slug
    │
    ▼
NoteDetail.vue 挂载
    │
    ▼
useContentLoader.loadText(note.file)
    │
    ▼
fetch('/content/notes/vue3-composition-api.md')
    │
    ▼
markdown-it 解析 → 渲染 HTML
```

### 并发安全设计

`useContentLoader.js` 使用 `loadPromise` 模式防止并发请求竞争：

```javascript
let loadPromise = null

async function loadIndex() {
  if (index.value) return index.value       // 已有数据
  if (loadPromise) return loadPromise       // 正在加载，复用 Promise

  loadPromise = (async () => {
    const response = await fetch('...')
    index.value = await response.json()
    return index.value
  })()
  return loadPromise
}
```

多个组件同时调用 `loadIndex()` 时，只发起一次网络请求。

## 组件架构

### 页面组件（Views）

| 组件 | 职责 |
|------|------|
| `Home.vue` | 首页 Hero + 粒子动画 + 最近内容 |
| `Notes.vue` | 笔记列表 + 标签过滤 + 分页 |
| `NoteDetail.vue` | 文章详情 + 右侧 TOC + 评论 |
| `Projects.vue` | 项目卡片列表 |
| `DocReader.vue` | 通用文档阅读器（项目/书籍共用） |
| `Books.vue` | 书架展示 |
| `PdfReader.vue` | PDF 阅读器（iframe 嵌入） |
| `Toolbox.vue` | 工具分类标签页 + 工具卡片 |
| `ToolboxDoc.vue` | 百宝箱文档阅读器 |
| `About.vue` | 关于页面 |

### 共享组件（Components）

| 组件 | 用途 |
|------|------|
| `Navbar.vue` | 顶部导航栏（毛玻璃效果） |
| `SiteFooter.vue` | 底部页脚 |
| `NoteCard.vue` | 笔记卡片 |
| `ProjectCard.vue` | 项目卡片 |
| `BookCard.vue` | 书籍卡片 |
| `ToolCard.vue` | 工具卡片 |
| `SideNav.vue` | 左侧文档目录 |
| `TableOfContents.vue` | 右侧文章目录（TOC） |
| `MarkdownRenderer.vue` | Markdown HTML 渲染容器 |
| `Comments.vue` | 评论组件（Giscus 占位） |
| `Pagination.vue` | 分页组件 |
| `TagFilter.vue` | 标签过滤栏 |
| `HeroParticles.vue` | 首页粒子动画 |

### 组合式函数（Composables）

| 函数 | 职责 |
|------|------|
| `useContentLoader` | 内容索引和 Markdown 文件加载 |
| `useMarkdown` | Markdown 解析 + TOC 提取 |

## 样式架构

```
src/styles/
├── variables.css     # CSS 自定义属性（设计令牌）
├── global.css        # 全局重置、布局、通用样式
├── markdown.css      # Markdown 渲染样式（代码块、引用、表格等）
└── transitions.css   # Vue 过渡动画定义
```

所有颜色、字体、间距通过 CSS 变量统一管理，修改 `variables.css` 即可全局换肤。

## 路由设计

```
/                           → Home.vue
/notes                      → Notes.vue
/notes/:slug                → NoteDetail.vue
/projects                   → Projects.vue
/projects/:slug/:page?      → DocReader.vue (meta.type = 'projects')
/books                      → Books.vue
/books/:slug/pdf/:page      → PdfReader.vue
/books/:slug/:page?         → DocReader.vue (meta.type = 'books')
/toolbox                    → Toolbox.vue
/toolbox/:doc               → ToolboxDoc.vue
/about                      → About.vue
```

> **注意**：`/books/:slug/pdf/:page` 必须放在 `/books/:slug/:page?` 之前，否则 `pdf` 会被当作 `:page` 参数匹配。

## 性能优化

| 优化项 | 实现方式 |
|--------|----------|
| 路由懒加载 | `() => import('../views/xxx.vue')` |
| Markdown 按需加载 | 只有进入详情页才 fetch 对应 .md 文件 |
| 索引防并发 | `loadPromise` 模式 |
| 图片懒加载 | 浏览器原生 `loading="lazy"` |
| 字体优化 | `font-display: swap` |
| 粒子动画性能 | Canvas 渲染，不超过 30 个粒子 |
