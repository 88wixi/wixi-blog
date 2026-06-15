# wixi · forest notes

> 一个安静但有锋利边界的个人博客,用来存放技术札记、阅读记录,以及对生活系统的观察。

基于 React 19 + Vite + TypeScript + Tailwind CSS v4 构建的个人博客站点,主题为「林间小记」。

## 部署

发布是**显性的**:每次 `git push` 到 `main`,GitHub Actions（`.github/workflows/deploy.yml`）会构建并发布到 GitHub Pages,记录可在仓库 Actions 页查看。同时 Vercel 通过其 Git 集成自动部署,两边同步上线。

- **GitHub Pages**:项目站点子路径 `/wixi-blog/`,由 CI 注入 `VITE_BASE=/wixi-blog/`;SPA 深链通过构建时生成的 `404.html` 兜底。
  首次启用:仓库 *Settings → Pages → Build and deployment → Source* 选 **GitHub Actions**。
- **Vercel**:根路径 `/`,SPA 路由在 `vercel.json` 中重写到 `index.html`。

`vite.config.ts` 的 `base` 由 `VITE_BASE` 环境变量切换(默认 `/`),路由 `basename` 取 `import.meta.env.BASE_URL`,因此同一份代码可同时适配两种路径。

> **照片接口地址(`VITE_PHOTOS_API`)**:两边构建都**不注入**这个变量,代码默认用 `https://photos.wixi88.xyz`(Worker 自定义域,国内外都可访问)。`*.workers.dev` 在国内被墙,**不要**把它配成构建变量,否则会覆盖默认值导致国内拉不到照片清单。详见下方「照片」一节。

## 功能

- **首页 `/`** — Hero 轮播、状态栏(正在读 / 本周主题 / 下一篇)、最近文章
- **文章 `/articles`** — 按分类浏览文章列表
- **文章详情 `/articles/:slug`** — Markdown 风格的阅读页
- **照片 `/photos`** — 按城市分组的影像记录
- **城市相册 `/photos/:city`** — 单个城市的照片集合
- **404 `/*`** — 自定义未找到页

文章分为四类:`生活设计 / 前端札记 / 写作 / 观察`,正文以 **Markdown** 写在 `content/articles/*.md`,由 `src/data/articles.ts` 在构建时读取(`import.meta.glob`)。

## 照片(Cloudflare R2)

照片**全部来自 Cloudflare R2**,仓库里不放图片文件,加图无需改代码、无需重新部署。整条链路:

1. **存储** — 按 `城市slug/文件名` 上传到 R2 bucket(如 `osaka/IMG_0852.jpg`)。
2. **列清单** — `worker/` 下的 Cloudflare Worker 绑定该 bucket,把图片按顶层文件夹(=城市 slug)分组成 JSON 返回。前端运行时拉一次(`src/data/photos.ts` 的 `fetchManifest`),并入对应城市。默认接口 `https://photos.wixi88.xyz`(Worker 自定义域)。
3. **原图** — 经自定义域 `https://img.wixi88.xyz/<slug>/<文件名>` 提供。
4. **缩略图** — 列表/相册走 **Cloudflare 图片变换**(`/cdn-cgi/image/...`,见 `photos.ts` 的 `thumb()`),把几 MB 原图现切成几十 KB 小图;**原图只在点开灯箱时加载**。需在 Cloudflare 控制台给 `wixi88.xyz` 这个 zone 开启 **Images → Transformations**(免费额度 5000 个唯一变换/月,结果会缓存,与访问量无关);未开启时前端 `onError` 会回退到原图,不会坏图。
5. **缓存与加载** — 清单缓存在 `localStorage`(再次进来秒出、后台校验更新);图片用 `IntersectionObserver` 懒加载(`useReveal` / `LazyImage`),滚动到附近才请求。

**加一座城市的照片**:

- 已有城市(`src/data/photos.ts` 的 `meta` 数组里已登记):直接往 R2 的 `<slug>/` 上传图片即可,最多约 1 分钟(CDN 缓存)出现。
- 新城市:先在 `meta` 数组加一条元数据(`slug / name / region / description / coords`),再按该 `slug` 往 R2 上传图片。照片标题由文件名自动推断(相机默认名回退为「城市 · 序号」)。

Worker 的部署见 [`worker/README.md`](worker/README.md)。

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | React 19 |
| 构建 | Vite 8 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4(`@tailwindcss/vite`) |
| 路由 | react-router-dom v7 |
| 内容 | Markdown（`react-markdown` + `remark-gfm`) |
| 图片 | Cloudflare R2（存储) + Worker（列清单) + Image Transformations（缩略图) |
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
worker/                # Cloudflare Worker：绑定 R2，列出照片清单（见 worker/README.md）
├── index.js
└── wrangler.toml
src/
├── components/        # 通用组件：Navbar、Footer、LazyImage（懒加载）、ZoomableImage（灯箱可缩放）等
├── data/              # 静态数据 / 内容加载器
│   ├── articles.ts    # 读取 content/articles/*.md 并解析 frontmatter
│   └── photos.ts      # 城市元数据 + R2 接口地址 + 缩略图(thumb) 逻辑
├── hooks/             # 自定义 hooks：useReveal（滚动入场）、usePhotoCities（R2 清单）、useTheme
├── pages/             # 各路由页面
│   ├── Home.tsx
│   ├── Articles.tsx
│   ├── ArticleDetail.tsx
│   ├── Photos.tsx     # 照片 · 按城市
│   ├── PhotoCity.tsx  # 单城相册 + 灯箱
│   └── NotFound.tsx
├── App.tsx            # 路由壳子(Navbar + Outlet + Footer，含路由切换回顶部)
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
- **照片**:往 Cloudflare R2 按 `城市slug/文件名` 上传即可,网站自动收录,**不用改代码、不用重新部署**。详见上方「照片」一节。

## License

个人项目,暂未指定开源协议,默认保留所有权利。
