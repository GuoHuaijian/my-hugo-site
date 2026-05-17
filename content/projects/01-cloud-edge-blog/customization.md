---
title: "主题定制"
---

# 主题定制

本博客的所有视觉样式通过 CSS 自定义属性（CSS Variables）统一管理，修改 `src/styles/variables.css` 即可实现全局换肤。

## 设计令牌

### 颜色

打开 `src/styles/variables.css`：

```css
:root {
  /* 背景色 */
  --color-bg-primary: #fafaf9;    /* 页面主背景 */
  --color-bg-card: #ffffff;       /* 卡片背景 */
  --color-bg-secondary: #f5f3f0;  /* 次级背景区块 */
  --color-bg-code: #f8f8fa;       /* 代码块背景 */

  /* 文字色 */
  --color-text-primary: #2d2d2d;    /* 正文 */
  --color-text-secondary: #6b7280;  /* 辅助文字 */
  --color-text-tertiary: #9ca3af;   /* 弱提示文字 */
  --color-text-quote: #4b5563;      /* 引用块文字 */

  /* 强调色 */
  --color-accent: #5b6abf;        /* 链接、按钮主色 */
  --color-accent-hover: #4a58a8;  /* 悬停态 */
  --color-accent-light: #e8eaf6;  /* 标签背景 */
  --color-accent-bg: #f0eeff;     /* 浅色背景 */

  /* 功能色 */
  --color-success: #578866;       /* 成功/通过 */
  --color-inline-code: #ad2144;   /* 行内代码 */

  /* 边框与阴影 */
  --color-border: #e5e2de;
  --color-shadow: rgba(0, 0, 0, 0.06);
  --color-shadow-hover: rgba(0, 0, 0, 0.1);
}
```

### 字体

```css
:root {
  --font-sans: "LXGW WenKai", "Noto Serif SC", "Songti SC", serif;
  --font-mono: "JetBrains Mono", "Fira Code", Consolas, monospace;
  --font-en: Inter, "SF Pro Text", Arial, sans-serif;
}
```

更换字体只需修改 `--font-sans` 的值。确保新字体已在 `index.html` 中引入。

### 字号

```css
:root {
  --text-xs: 0.75rem;    /* 12px - 小标签 */
  --text-sm: 0.875rem;   /* 14px - 辅助信息 */
  --text-base: 1rem;     /* 16px - 正文 */
  --text-lg: 1.2rem;     /* 19px - 卡片标题 */
  --text-xl: 1.5rem;     /* 24px - 板块标题 */
  --text-2xl: 2rem;      /* 32px - 页面大标题 */
}
```

### 间距

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### 圆角

```css
:root {
  --radius-sm: 6px;   /* 小标签 */
  --radius-md: 8px;   /* 按钮、标签 */
  --radius-lg: 12px;  /* 卡片 */
  --radius-full: 9999px; /* 药丸按钮 */
}
```

### 布局

```css
:root {
  --max-width: 1200px;     /* 页面最大宽度 */
  --navbar-height: 64px;   /* 导航栏高度 */
  --footer-height: 74px;   /* 页脚高度 */
}
```

### 动画

```css
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 快速换肤示例

### 深色主题

```css
:root {
  --color-bg-primary: #1a1a2e;
  --color-bg-card: #16213e;
  --color-bg-secondary: #0f3460;
  --color-bg-code: #1a1a2e;

  --color-text-primary: #eaeaea;
  --color-text-secondary: #a0a0b0;
  --color-text-tertiary: #707080;
  --color-text-quote: #b0b0c0;

  --color-accent: #7c83d4;
  --color-accent-hover: #9098e0;
  --color-accent-light: #2a2a4e;
  --color-accent-bg: #1e1e3e;

  --color-success: #6da87e;
  --color-inline-code: #f080a0;
  --color-inline-code-bg: #2a1a2e;

  --color-border: #2a2a4e;
  --color-shadow: rgba(0, 0, 0, 0.3);
  --color-shadow-hover: rgba(0, 0, 0, 0.5);
}
```

### 暖色主题

```css
:root {
  --color-accent: #c4703f;
  --color-accent-hover: #a85a2e;
  --color-accent-light: #f5e6d8;
  --color-accent-bg: #fdf0e5;

  --color-success: #5a8a5a;
  --color-inline-code: #b84a4a;
}
```

## 导航栏定制

导航栏样式在 `src/components/Navbar.vue` 中定义。

### 修改 Logo 文字

```vue
<!-- 找到 RouterLink 中的文字 -->
<RouterLink to="/" class="logo">
  <span class="logo-text">你的博客名</span>
</RouterLink>
```

### 修改导航项

```vue
<template v-for="item in navItems" :key="item.path">
  <RouterLink :to="item.path">{{ item.label }}</RouterLink>
</template>

<script setup>
const navItems = [
  { path: '/', label: '首页' },
  { path: '/notes', label: '笔记' },
  { path: '/projects', label: '项目' },
  { path: '/books', label: '读书' },
  { path: '/toolbox', label: '百宝箱' },
  { path: '/about', label: '关于' }
]
</script>
```

## 首页 Hero 定制

首页 Hero 区域在 `src/views/Home.vue` 中。

### 修改主标题和副标题

```vue
<h1 class="hero-title">你的博客标题</h1>
<p class="hero-subtitle">你的博客副标题</p>
```

### 修改粒子动画

粒子动画组件在 `src/components/HeroParticles.vue` 中，可以调整：

```javascript
const PARTICLE_COUNT = 20    // 粒子数量
const MAX_SPEED = 0.5        // 最大速度
const CONNECTION_DIST = 120  // 连线距离
```

## 页脚定制

页脚在 `src/components/SiteFooter.vue` 中：

```vue
<p>© {{ year }} 你的名字 · 用 Vue 搭建</p>
<p>你的个性签名</p>
```

## Markdown 样式定制

Markdown 渲染样式在 `src/styles/markdown.css` 中。

### 修改代码块样式

```css
.markdown-body pre {
  background: var(--color-bg-code);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
}

.markdown-body code {
  font-family: var(--font-mono);
  font-size: 14px;
}
```

### 修改引用块样式

```css
.markdown-body blockquote {
  border-left: 3px solid var(--color-accent);
  background: var(--color-accent-bg);
  padding: 16px 20px;
  color: var(--color-text-quote);
}
```

## 添加新页面

1. 在 `src/views/` 下创建新页面组件
2. 在 `src/router/index.js` 中添加路由
3. 在 `src/components/Navbar.vue` 中添加导航项

```javascript
// src/router/index.js
{ path: '/guestbook', name: 'guestbook', component: () => import('../views/Guestbook.vue'), meta: { title: '留言' } }
```
