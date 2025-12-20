# Candy2 (Hugo)

一个优雅现代的 Hugo 主题，采用磨砂玻璃效果和水平滚动设计。

<img width="3840" height="1822" alt="image" src="https://github.com/user-attachments/assets/cae349c6-6523-40ec-9313-3cec3b148545" />

<img width="3840" height="1822" alt="image" src="https://github.com/user-attachments/assets/0df4d44d-a74b-4ea3-9690-0273a5365021" />



## ✨ 特性

- 🎨 **毛玻璃设计** - 精美的磨砂玻璃效果，支持背景模糊
- 💎 **原创交互** - 独一无二的桌面端独特的水平卡片式导航交互
- 🌙 **深色模式** - 完全支持自适应的深色模式
- 📱 **响应式** - 在移动端和桌面端都有流畅的体验
- 🎬 **流畅动画** - 分类目录、翻页、打开文章都有自然的动画过渡
- 💬 **评论支持** - 轻松集成 utteranc.es、Gitalk 等评论组件

主题预览：https://mozz.ie/

## 🚀 快速开始

### 安装

1. **安装 Hugo Extended**（需要 v0.152.2 或更高版本）：
```bash
# 检查你的 Hugo 版本
hugo version

# 如果没有，下载 Hugo Extended
# https://github.com/gohugoio/hugo/releases
```

2. **将主题添加到你的 Hugo 站点**：

   **方法 A：Git 子模块（推荐）**
   ```bash
   cd your-hugo-site
   git submodule add https://github.com/Archeb/candy2-hugo.git themes/candy2-hugo
   ```

   **方法 B：Git 克隆**
   ```bash
   cd your-hugo-site/themes
   git clone https://github.com/Archeb/candy2-hugo.git candy2-hugo
   ```

   **方法 C：直接下载**
   - 下载[最新版本](https://github.com/Archeb/candy2-hugo/releases)
   - 解压到 `your-hugo-site/themes/candy2-hugo`

3. **配置你的站点**：

   在站点根目录创建或编辑 `hugo.toml`（或 `config.toml`）：
   ```toml
   baseURL = 'https://example.com/'
   languageCode = 'zh-CN'
   title = '你的博客名称'
   theme = 'candy2-hugo'

   [pagination]
     pagerSize = 10

   [params]
     author = "你的名字"
     description = "一个优雅的 Hugo 博客主题"
     avatar = "/img/icon.png"
     icon = "/img/icon.png"
     defaultImage = "/img/cover1.jpg"
     copyright = "你的名字 © 2025"
     authorImage = "/img/icon.png"

   [markup]
     [markup.highlight]
       style = 'monokai'
       lineNos = false
     [markup.goldmark]
       [markup.goldmark.renderer]
         unsafe = true

   [[menu.main]]
     name = "关于"
     url = "/about/"
     weight = 5
   ```

4. **启动开发服务器**：
   ```bash
   hugo server
   ```

5. 访问 `http://localhost:1313`

## 📝 创建内容

### 新建文章

```bash
hugo new content posts/my-first-post.md
```

### 文章头信息

```yaml
---
title: "我的第一篇文章"
date: 2024-11-24T10:00:00+08:00
draft: false
tags: ["技术", "hugo"]
categories: ["开发"]
featuredImage: "/img/cover1.jpg"
description: "文章的简短描述"
---

在这里编写你的 Markdown 内容...
```

### 必需的头信息字段

- `title`: 文章标题
- `date`: 发布日期
- `tags`: 标签数组（可选但推荐）
- `categories`: 分类数组（可选）
- `featuredImage`: 特色图片 URL（可选，未设置时使用 defaultImage）
- `description`: 文章简短描述，用于卡片预览

## 🎨 自定义

### 颜色和样式

编辑 `assets/scss/` 目录下的 SCSS 文件来自定义颜色、动画和效果。

主要样式文件：
- `assets/scss/style.scss` - 主样式入口
- `assets/scss/bean-main.scss` - 导航栏样式
- `assets/scss/single.scss` - 文章页面样式
- `assets/scss/article-content.scss` - 文章内容样式

### 菜单项

在 `hugo.toml` 中添加菜单项：

```toml
[[menu.main]]
  name = "自定义页面"
  url = "/custom/"
  weight = 4
```

### 头像和图片

将你的图片放在 `static/img/` 目录，并在配置中引用：

```toml
[params]
  avatar = "/img/your-avatar.png"
  defaultImage = "/img/your-default-cover.jpg"
  authorImage = "/img/your-author.png"
```

### 添加评论系统

主题支持通过配置文件添加任意评论组件。在 `hugo.toml` 中添加 `customHeaders` 和 `customComments` 参数：

#### 例：使用 Gitalk

```toml
[params]
  customHeaders = '''
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css">
<script src="https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js"></script>
'''
  customComments = '''
<div id="gitalk-container"></div>
<script>
new Gitalk({
  clientID: '你的 GitHub Application Client ID',
  clientSecret: '你的 GitHub Application Client Secret',
  repo: '你的仓库名',
  owner: '你的 GitHub 用户名',
  admin: ['你的 GitHub 用户名'],
  id: location.pathname,
  distractionFreeMode: false
}).render('gitalk-container')
</script>
'''
```

点击侧边的"查看评论"按钮会展开评论区域。

## 📁 主题结构

```
candy2-hugo/
├── archetypes/
│   └── default.md          # 内容模板
├── assets/
│   └── scss/               # SCSS 样式文件
│       ├── style.scss      # 主样式入口
│       ├── bean-main.scss  # 导航栏样式
│       ├── single.scss     # 文章页样式
│       └── article-content.scss  # 文章内容样式
├── layouts/
│   ├── _default/
│   │   ├── baseof.html     # 基础模板
│   │   ├── list.html       # 列表页模板
│   │   └── single.html     # 文章页模板（模态框）
│   ├── index.html          # 首页模板
│   └── partials/
│       ├── head/           # Head 相关部分
│       │   ├── head.html   # HTML head
│       │   └── opengraph.html  # OpenGraph 元数据
│       ├── navigation.html # 侧边栏导航
│       └── article-card.html   # 文章卡片
├── static/
│   ├── js/
│   │   └── candy2.js       # 交互功能脚本
│   └── img/                # 主题图片
├── exampleSite/            # 示例站点
├── theme.toml              # 主题元数据
├── README.md               # 本文件
└── LICENSE                 # GPL-3.0 许可证
```

## 📄 许可证

GPL-3.0 - 详见 [LICENSE](LICENSE) 文件。
