# ✨ My Hugo Blog (Blowfish Theme)

一个基于 **Hugo** 和 **Blowfish Theme** 搭建的快速、简洁、现代化个人博客。

在线访问

👉 https://slothcoder.cn

------

## 🚀 Features

- ⚡ **极速 Hugo 静态生成**
- 🎨 **Blowfish 主题：简洁、美观、可定制**
- 🌓 深色 / 浅色模式自动切换
- 📱 完全响应式布局
- 📝 Markdown 文章支持
- 📊 Mermaid 图表支持
- 🔎 内置搜索（Fuse.js）
- 🖼️ 支持文章封面 + 默认封面
- 🌐 GitHub Pages 自动部署

------

## 📦 项目结构

```tex
myblog/
├── content/        # 博客文章
├── assets/         # 自定义资源（css/js）
├── layouts/        # 自定义模板
├── static/         # 静态文件（图片、icon）
├── config/         # 站点配置
└── themes/
    └── blowfish/   # 主题
```

------

## 🛠 本地运行

```sh
hugo server -D
```

浏览器访问：

👉 http://localhost:1313

------

## 📤 构建生产版本

```sh
hugo
```

生成好的静态文件在：

```tex
public/
```

------

## 🚀 GitHub Pages 部署

仓库设置：

```tex
Settings → Pages → Deploy from branch → gh-pages (or main)
```

你也可以使用 GitHub Actions 自动部署：

```tex
.github/workflows/hugo.yml
```

------

## 📝 写文章

```sh
hugo new content/posts/my-first-post.md
```

写完推送即可。

------

## 📄 License

This project is licensed under the MIT License.
