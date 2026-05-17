---
title: "内容管理指南"
---

# 内容管理指南

本博客的所有内容都通过 `content/` 目录下的 Markdown 文件和 JSON 文件管理。添加、修改、删除内容无需修改任何代码。

## 添加笔记

笔记是博客的技术文章模块，位于 `content/notes/` 目录下。

### 步骤

1. 在 `content/notes/` 下创建 `.md` 文件，文件名即为 URL slug
2. 编写 Front Matter（元信息）
3. 编写正文内容
4. 运行 `npm run generate` 重新生成索引

### 文件格式

```markdown
---
title: "Vue 3 组合式 API 最佳实践"
author: "店主"
date: 2024-01-15
tags: ["Vue", "前端", "JavaScript"]
summary: "探索 Vue 3 Composition API 的设计理念与实战技巧"
cover: "/content/covers/vue3-composition-api.svg"
---

# 正文标题

正文内容使用标准 Markdown 语法...

## 二级标题

更多内容...
```

### Front Matter 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 否 | 文章标题，默认使用文件名 |
| `author` | string | 否 | 作者名，默认 "店主" |
| `date` | date | 否 | 发布日期，用于排序 |
| `tags` | string[] | 否 | 标签列表，用于分类过滤 |
| `summary` | string | 否 | 文章摘要，默认自动截取正文前 150 字 |
| `cover` | string | 否 | 封面图路径，默认自动匹配 `content/covers/{slug}.{ext}` |
| `readingTime` | number | 否 | 阅读时间（分钟），默认按 300 字/分钟计算 |

### 封面图片

封面图片放在 `content/covers/` 目录下，支持以下格式：
- `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`

命名规则：与笔记文件名（不含扩展名）一致。

例如笔记文件 `vue3-composition-api.md` 的封面可以是：
- `content/covers/vue3-composition-api.png`
- `content/covers/vue3-composition-api.svg`

也可以在 Front Matter 中显式指定 `cover` 字段。

---

## 添加项目

项目是展示个人作品的模块，每个项目是一个文件夹，包含元信息和多页文档。

### 步骤

1. 在 `content/projects/` 下创建项目文件夹
2. 创建 `index.md` 填写项目元信息
3. 创建各文档页面 `.md` 文件
4. 运行 `npm run generate`

### 目录结构

```
content/projects/my-project/
├── index.md              # 项目元信息（必须有）
├── getting-started.md    # 文档页面 1
├── installation.md       # 文档页面 2
├── api-reference.md      # 文档页面 3
└── changelog.md          # 文档页面 4
```

### index.md 格式

```markdown
---
name: "CloudEdge UI"
description: "一个轻量级的 Vue 3 组件库"
tags: ["Vue 3", "组件库", "TypeScript"]
status: "维护中"
cover: "/content/covers/project-cloud-edge-ui.svg"
stars: 128
forks: 32
liveUrl: "https://example.com"
githubUrl: "https://github.com/xxx/cloud-edge-ui"
docs:
  - title: "快速开始"
    file: "getting-started.md"
  - title: "安装配置"
    file: "installation.md"
  - title: "API 参考"
    file: "api-reference.md"
  - title: "更新日志"
    file: "changelog.md"
---

# CloudEdge UI

项目详细介绍...
```

### Front Matter 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 否 | 项目名称，默认使用文件夹名 |
| `description` | string | 否 | 项目简介，默认截取正文前 130 字 |
| `tags` | string[] | 否 | 技术标签 |
| `status` | string | 否 | 项目状态，默认 "维护中" |
| `cover` | string | 否 | 封面图路径 |
| `stars` | number | 否 | GitHub Stars 数 |
| `forks` | number | 否 | GitHub Forks 数 |
| `liveUrl` | string | 否 | 在线演示地址 |
| `githubUrl` | string | 否 | GitHub 仓库地址 |
| `docs` | array | 否 | 文档列表，控制左侧目录顺序 |

### docs 字段说明

`docs` 数组中的每一项：

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 目录显示标题 |
| `file` | string | 对应的 `.md` 文件名 |

如果未提供 `docs` 字段，系统会按文件名自动排序。

---

## 添加书籍

书籍是读书笔记模块，每本书是一个文件夹，包含元信息和章节文档。

### 步骤

1. 在 `content/books/` 下创建书籍文件夹
2. 创建 `index.md` 填写书籍元信息
3. 创建各章节 `.md` 文件
4. （可选）添加 PDF 文件
5. 运行 `npm run generate`

### 目录结构

```
content/books/my-book/
├── index.md              # 书籍元信息（必须有）
├── chapter-01.md         # 第一章
├── chapter-02.md         # 第二章
├── chapter-03.md         # 第三章
├── summary.md            # 总结
└── appendix.pdf          # PDF 章节（可选）
```

### index.md 格式

```markdown
---
title: "数据结构与算法之美"
author: "王争"
status: "在读"
cover: "/content/covers/data-structures-algorithms.svg"
quote: "搞定数据结构与算法，编程不再难。"
rating: 4
chapters:
  - title: "第一章 复杂度分析"
    file: "chapter-01.md"
  - title: "第二章 数组和链表"
    file: "chapter-02.md"
  - title: "第三章 栈和队列"
    file: "chapter-03.md"
  - title: "总结与思考"
    file: "summary.md"
---

# 数据结构与算法之美

书籍简介...
```

### Front Matter 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 否 | 书名，默认使用文件夹名 |
| `author` | string | 否 | 作者 |
| `status` | string | 否 | 阅读状态："已读" / "在读" / "想读" |
| `cover` | string | 否 | 封面图路径 |
| `quote` | string | 否 | 一句话推荐语 |
| `rating` | number | 否 | 评分（1-5） |
| `chapters` | array | 否 | 章节列表，控制左侧目录顺序 |

### chapters 字段说明

`chapters` 数组中的每一项：

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 目录显示标题 |
| `file` | string | 对应的 `.md` 文件名（或 `.pdf` 文件名） |

### PDF 章节支持

将 `.pdf` 文件直接放在书籍文件夹下即可自动识别。点击 PDF 章节时会打开浏览器内置 PDF 阅读器。

```
content/books/my-book/
├── index.md
├── chapter-01.md
└── appendix.pdf          ← 自动识别为 PDF 章节
```

PDF 章节在左侧目录中会显示 **PDF** 标签。

---

## 添加百宝箱工具

百宝箱支持两种类型：**外部链接**和**内部文档**。

### 编辑 toolbox.json

文件位置：`content/toolbox.json`

```json
{
  "categories": [
    {
      "name": "开发工具",
      "icon": "Code",
      "items": [
        {
          "name": "VS Code",
          "description": "最好用的代码编辑器",
          "url": "https://code.visualstudio.com",
          "icon": "Monitor"
        },
        {
          "name": "Git 常用命令",
          "description": "日常开发必备的 Git 命令速查",
          "file": "git-cheatsheet.md"
        }
      ]
    }
  ]
}
```

### 分类字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 分类名称 |
| `icon` | string | Lucide 图标名称（如 `Code`, `Wrench`, `BookOpen`） |
| `items` | array | 工具列表 |

### 工具项字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 工具名称 |
| `description` | string | 一句话描述 |
| `url` | string | 外部链接地址（有此字段则跳转外链） |
| `file` | string | 内部文档文件名（有此字段则打开文档阅读器） |
| `icon` | string | Lucide 图标名称 |

> **关键规则**：`url` 和 `file` 二选一。有 `url` 就是外链跳转，有 `file` 就是内部文档。

### 内部文档

内部文档文件放在 `content/toolbox/` 目录下，使用标准 Markdown 格式：

```markdown
---
title: "Git 常用命令"
---

# Git 常用命令

## 基础操作

...
```

---

## 封面图片管理

所有封面图片统一放在 `content/covers/` 目录下。

### 自动匹配规则

如果 Front Matter 中没有指定 `cover` 字段，系统会按以下顺序自动查找：

1. 检查 `content/covers/{slug}.png`
2. 检查 `content/covers/{slug}.jpg`
3. 检查 `content/covers/{slug}.jpeg`
4. 检查 `content/covers/{slug}.gif`
5. 检查 `content/covers/{slug}.webp`
6. 检查 `content/covers/{slug}.svg`

如果都找不到，则不显示封面（使用默认占位符）。

### slug 对照表

| 内容类型 | slug 来源 |
|----------|-----------|
| 笔记 | 文件名（不含 `.md`） |
| 项目 | 文件夹名 |
| 书籍 | 文件夹名 |

---

## 封面图设计规范

三种卡片（笔记、项目、读书）的封面区域尺寸不同，设计封面时请参考以下规格。

### 笔记卡片

| 项目 | 值 |
|------|-----|
| 桌面端渲染尺寸 | 300–360px 宽 × 172px 高 |
| 移动端渲染尺寸 | 全屏宽 × 150px 高 |
| 设计稿推荐尺寸 | **720 × 344 px**（2x 倍率） |
| 画面比例 | ≈ 2.1 : 1（宽幅横构图） |
| 显示模式 | `object-fit: cover`（图片裁剪适配容器） |

### 项目卡片

| 项目 | 值 |
|------|-----|
| 桌面端渲染尺寸 | 340px+ 宽 × 180px 高 |
| 移动端渲染尺寸 | 全屏宽 × 156px 高 |
| 设计稿推荐尺寸 | **680 × 360 px**（2x 倍率） |
| 画面比例 | ≈ 1.9 : 1（宽幅横构图） |
| 显示模式 | `object-fit: cover` |

### 读书卡片

| 项目 | 值 |
|------|-----|
| 桌面端渲染尺寸 | 116px 宽 × 168px+ 高（竖版） |
| 移动端渲染尺寸 | 全屏宽 × 120px+ 高 |
| 设计稿推荐尺寸 | **232 × 336 px**（2x 倍率） |
| 画面比例 | ≈ 1 : 1.45（竖版书籍造型） |
| 显示模式 | `object-fit: cover` |

### 设计注意事项

1. **按 2x 倍率出图**：以上推荐尺寸已是 Retina 2x 尺寸，设计时直接按此尺寸绘制，开发侧会缩放 50% 至 CSS 像素尺寸
2. **满版出血**：封面图填充整个容器，不要留白边
3. **安全区**：关键文字和元素放在中央区域——横向卡片左右两侧预留 5% 裁剪余量，竖向卡片上下两端预留 5%
4. **格式**：WebP 优先（体积小质量高），备选 JPG / PNG
5. **路径**：放入 `public/content/covers/` 目录，文件名与笔记/项目/书籍的 slug 一致

> 不提供封面图时，系统会自动根据标签名或 GitHub icon 生成浅色渐变底 + 文字的 fallback 占位。

---

## 内容更新流程

```
1. 在 content/ 下添加/修改/删除文件
2. 运行 npm run generate（重新生成索引）
3. 提交代码 git add . && git commit -m "添加新文章"
4. 推送代码 git push（触发自动部署）
```

> **注意**：修改 `content/` 目录后必须运行 `npm run generate`，否则新的内容不会反映到 `public/content-index.json` 中。
