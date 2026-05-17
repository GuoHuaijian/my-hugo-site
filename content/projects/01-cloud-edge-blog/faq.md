---
title: "常见问题"
---

# 常见问题

## 内容相关

### Q: 修改了 Markdown 文件，但页面没有更新？

运行 `npm run generate` 重新生成内容索引。开发服务器不会自动监听 `content/` 目录变化。

```bash
npm run generate
```

### Q: 如何删除一篇文章？

直接删除 `content/notes/` 下对应的 `.md` 文件，然后运行 `npm run generate`。

### Q: 封面图片不显示怎么办？

检查以下几点：
1. 图片是否在 `content/covers/` 目录下
2. 文件名是否与 slug 一致（不含扩展名）
3. 扩展名是否在支持列表中：`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`
4. 也可以在 Front Matter 中显式指定 `cover` 字段

### Q: 文章排序是按什么规则？

- **笔记**：按 Front Matter 中的 `date` 字段倒序（最新的在前）
- **项目**：按文件夹名排序
- **书籍**：按文件夹名排序
- **文档/章节**：按 `docs`/`chapters` 数组中的顺序，未指定则按文件名排序

### Q: 支持哪些 Markdown 语法？

支持标准 CommonMark 语法 plus GFM（GitHub Flavored Markdown）：
- 标题、段落、列表、代码块、行内代码
- 链接、图片、引用块
- 表格、任务列表
- 删除线

## 开发相关

### Q: 开发服务器端口被占用？

Vite 会自动尝试下一个可用端口。如需指定端口：

```bash
npx vite --port 3000
```

### Q: 如何添加新的页面？

1. 在 `src/views/` 下创建 Vue 组件
2. 在 `src/router/index.js` 中添加路由
3. 在 `src/components/Navbar.vue` 中添加导航项

### Q: 如何修改导航栏的菜单项？

编辑 `src/components/Navbar.vue` 中的 `navItems` 数组：

```javascript
const navItems = [
  { path: '/', label: '首页' },
  { path: '/notes', label: '笔记' },
  // 添加/删除/修改
]
```

### Q: 如何集成评论系统？

编辑 `src/components/Comments.vue`，将 Giscus 配置替换为你的仓库信息：

```html
<script
  src="https://giscus.app/client.js"
  data-repo="你的用户名/你的仓库"
  data-repo-id="你的仓库ID"
  data-category="Announcements"
  data-category-id="分类ID"
  data-mapping="pathname"
  data-strict="0"
  data-reactions-enabled="1"
  data-emit-metadata="0"
  data-input-position="bottom"
  data-theme="light"
  data-lang="zh-CN"
  crossorigin="anonymous"
  async
></script>
```

仓库 ID 和分类 ID 可以在 [giscus.app](https://giscus.app/zh-CN) 上获取。

## 部署相关

### Q: GitHub Pages 部署后 404？

检查 `vite.config.js` 中的 `base` 路径是否正确：

- 用户主页（`用户名.github.io`）：`base: '/'`
- 项目页面（`用户名.github.io/仓库名`）：`base: '/仓库名/'`

### Q: 部署后样式丢失？

确保 `base` 路径配置正确，并且 `npm run build` 成功完成。

### Q: 如何回滚到上一个版本？

```bash
# 查看提交历史
git log --oneline

# 回退到指定提交
git revert <commit-hash>
git push
```

## 性能相关

### Q: 首屏加载慢怎么办？

- 检查封面图片大小，建议使用压缩后的图片
- 减少首页粒子数量（修改 `HeroParticles.vue` 中的 `PARTICLE_COUNT`）
- 使用 `npm run build` 构建生产版本（包含代码压缩和优化）

### Q: 内容索引 JSON 太大？

如果文章数量超过几百篇，可以考虑：
- 分页加载内容索引
- 按需加载分类索引
