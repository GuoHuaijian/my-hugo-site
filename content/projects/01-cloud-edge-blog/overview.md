---
title: "项目概述"
---

# 项目概述

## 什么是云边小卖部？

云边小卖部是一个**静态 Markdown 个人博客系统**，以张嘉佳《云边有个小卖部》为灵感背景，融合温馨氛围与程序员极客气质。

核心理念：
> 每一篇文章都是货架上的一件小商品，安静地等待被人拿起翻阅。

## 功能模块

| 模块 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 全屏 Hero 区域 + 粒子动画 + 最近内容 |
| 笔记 | `/notes` | 技术文章列表，支持标签过滤和分页 |
| 笔记详情 | `/notes/:slug` | 文章正文 + 右侧目录 + 评论区 |
| 项目 | `/projects` | 开源项目展示卡片 |
| 项目文档 | `/projects/:slug/:page?` | 三栏文档阅读器（左侧目录 + 正文 + 右侧 TOC） |
| 读书 | `/books` | 书架展示，含封面、状态、推荐语 |
| 读书详情 | `/books/:slug/:page?` | 复用文档阅读器，支持 Markdown 和 PDF |
| 百宝箱 | `/toolbox` | 工具收藏，支持外链和内部文档 |
| 关于 | `/about` | 个人介绍、技能标签、联系方式 |

## 技术栈

### 核心依赖

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5+ | 响应式 UI 框架 |
| Vue Router | 4.5+ | 客户端路由 |
| Vite | 6.3+ | 构建工具和开发服务器 |
| markdown-it | 14.1+ | Markdown 解析引擎 |
| lucide-vue-next | 0.511+ | 图标库 |

### 构建脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 生成内容索引 + 启动开发服务器 |
| `npm run generate` | 仅生成内容索引 |
| `npm run build` | 生成内容索引 + 构建生产版本 |
| `npm run preview` | 本地预览构建结果 |

## 设计理念

### 色彩系统

```
背景层
├── 主背景：#FAFAF9（温暖灰白，像高品质哑光纸张）
├── 卡片背景：#FFFFFF（纯白，微弱阴影浮起）
└── 次级背景：#F5F3F0（淡暖灰，用于区块分隔）

文字层
├── 主文字：#2D2D2D（深灰，非纯黑，减少视觉压力）
├── 次文字：#6B7280（中灰，用于辅助信息）
└── 弱文字：#9CA3AF（浅灰，用于时间、标签）

强调色
├── 主强调色：#5B6ABF（靛蓝紫，像墨水笔的标注）
├── 悬停态：#4A58A8（深一度靛蓝紫）
└── 柔和点缀：#E8EAF6（极淡靛蓝紫）
```

### 字体系统

- **中文主字体**：LXGW WenKai（霞鹜文楷，温润文艺）
- **备选中文**：Noto Serif SC, serif
- **英文/代码**：JetBrains Mono, Fira Code, Consolas
- **正文英文**：Inter, SF Pro Text, Arial

### 动效原则

- 所有动画 150ms - 350ms
- 缓动曲线：`cubic-bezier(0.4, 0, 0.2, 1)`
- 原则：恰到好处，不花哨

## 项目结构速览

```
cloud-edge-blog/
├── content/              # 所有内容 Markdown 文件
│   ├── notes/            # 笔记文章
│   ├── projects/         # 项目文档
│   ├── books/            # 读书笔记
│   ├── toolbox/          # 百宝箱文档
│   ├── covers/           # 封面图片
│   └── toolbox.json      # 百宝箱工具列表
├── public/               # 静态资源（构建输出）
├── scripts/
│   └── generate-index.js # 内容索引生成脚本
├── src/
│   ├── components/       # Vue 组件
│   ├── composables/      # 组合式函数
│   ├── router/           # 路由配置
│   ├── styles/           # CSS 样式
│   ├── utils/            # 工具函数
│   └── views/            # 页面组件
├── index.html
├── package.json
└── vite.config.js
```
