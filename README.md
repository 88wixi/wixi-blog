# wixi · forest notes

> 一个安静但有锋利边界的个人博客,用来存放技术札记、阅读记录,以及对生活系统的观察。

基于 React 19 + Vite + TypeScript + Tailwind CSS v4 构建的个人博客站点,主题为「林间小记」。

## 在线预览

通过 Vercel 部署,SPA 路由已在 `vercel.json` 中重写到 `index.html`。

## 功能

- **首页 `/`** — Hero 轮播、状态栏(正在读 / 本周主题 / 下一篇)、最近文章
- **文章 `/articles`** — 按分类浏览文章列表
- **文章详情 `/articles/:slug`** — Markdown 风格的阅读页
- **照片 `/photos`** — 按城市分组的影像记录
- **城市相册 `/photos/:city`** — 单个城市的照片集合
- **404 `/*`** — 自定义未找到页

文章分为四类:`生活设计 / 前端札记 / 写作 / 观察`,数据写在 `src/data/articles.ts` 中。

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | React 19 |
| 构建 | Vite 8 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4(`@tailwindcss/vite`) |
| 路由 | react-router-dom v7 |
| 部署 | Vercel |

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
src/
├── components/        # Navbar、Footer 等通用组件
├── data/              # 文章、城市照片等静态数据
│   ├── articles.ts
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

- **新文章**:在 `src/data/articles.ts` 的 `articles` 数组里添加一条,必填 `slug / title / date / excerpt / category / tags / readingMinutes / content`。
- **新城市照片**:在 `src/data/photos.ts` 的 `cities` 数组里添加一条,`photos` 字段为照片列表。

## License

个人项目,暂未指定开源协议,默认保留所有权利。
