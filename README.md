# wixi · forest notes

> 一个安静但有锋利边界的个人博客,用来存放技术札记、阅读记录,以及对生活系统的观察。

基于 React 19 + Vite + TypeScript + Tailwind CSS v4 构建的个人博客站点,主题为「林间小记」。

## 部署

发布是**显性的**:每次 `git push` 到 `main`,GitHub Actions（`.github/workflows/deploy.yml`）会构建并发布到 GitHub Pages,记录可在仓库 Actions 页查看。同时 Vercel 通过其 Git 集成自动部署,两边同步上线。

- **GitHub Pages**:项目站点子路径 `/wixi-blog/`,由 CI 注入 `VITE_BASE=/wixi-blog/`;SPA 深链通过构建时生成的 `404.html` 兜底。
  首次启用:仓库 *Settings → Pages → Build and deployment → Source* 选 **GitHub Actions**。
- **Vercel**:根路径 `/`,SPA 路由在 `vercel.json` 中重写到 `index.html`。

`vite.config.ts` 的 `base` 由 `VITE_BASE` 环境变量切换(默认 `/`),路由 `basename` 取 `import.meta.env.BASE_URL`,因此同一份代码可同时适配两种路径。

## 功能

- **首页 `/`** — Hero 轮播、状态栏(正在读 / 本周主题 / 下一篇)、最近文章
- **文章 `/articles`** — 按分类浏览文章列表
- **文章详情 `/articles/:slug`** — Markdown 风格的阅读页
- **照片 `/photos`** — 按城市分组的影像记录
- **城市相册 `/photos/:city`** — 单个城市的照片集合
- **404 `/*`** — 自定义未找到页

文章分为四类:`生活设计 / 前端札记 / 写作 / 观察`,正文以 **Markdown** 写在 `content/articles/*.md`,由 `src/data/articles.ts` 在构建时读取(`import.meta.glob`)。

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | React 19 |
| 构建 | Vite 8 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4(`@tailwindcss/vite`) |
| 路由 | react-router-dom v7 |
| 内容 | Markdown（`react-markdown` + `remark-gfm`) |
| 部署 | GitHub Pages（Actions) + Vercel |

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm typecheck

# Lint
pnpm lint

# 生产构建
pnpm build

# 预览构建产物
pnpm preview
```

> 推荐使用 pnpm(项目自带 `pnpm-lock.yaml`),也可用 npm / yarn。

## 目录结构

```
content/
└── articles/          # 文章正文（Markdown + frontmatter）
    └── *.md
src/
├── components/        # Navbar、Footer 等通用组件
├── data/              # 静态数据 / 内容加载器
│   ├── articles.ts    # 读取 content/articles/*.md 并解析 frontmatter
│   └── photos.ts
├── hooks/             # 自定义 hooks(如 useReveal)
├── pages/             # 各路由页面
│   ├── Home.tsx
│   ├── Articles.tsx
│   ├── ArticleDetail.tsx
│   ├── Photos.tsx
│   ├── PhotoCity.tsx
│   └── NotFound.tsx
├── App.tsx            # 路由壳子(Navbar + Outlet + Footer)
├── main.tsx           # 入口 & 路由表
└── index.css          # 全局样式与 Tailwind 配置
```

## 写作 / 添加内容

- **新文章**:在 `content/articles/` 下新建一个 `<slug>.md`,顶部写 frontmatter,下面写正文:

  ```markdown
  ---
  slug: my-new-post
  title: 标题
  date: 2026-06-12
  category: tech        # life / tech / writing / observation
  tags: [标签一, 标签二]
  readingMinutes: 5
  excerpt: 列表页显示的一句话摘要。
  ---

  正文用 Markdown 写。支持标题、列表、引用、代码块、表格等。

  ## 小标题

  图片**走外链**(图床 / CDN 的完整 URL),仓库里不放图片文件,避免体积膨胀:

  ![图说](https://example.com/your-image.jpg)
  ```

  保存后 `git push` 即自动发布,无需改任何代码。
- **新城市照片**:在 `src/data/photos.ts` 的 `cities` 数组里添加一条,`photos` 字段为照片列表。

## License

个人项目,暂未指定开源协议,默认保留所有权利。
