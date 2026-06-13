# 照片清单 Worker

一个极小的 Cloudflare Worker，绑定你的 R2 bucket，把里面的图片按「顶层文件夹(=城市 slug)」
分组成 JSON 返回。前端运行时拉一次，上传新图即时显示，**不用再改 txt、也不用重新部署网站**。

## 一次性部署

1. 装 wrangler（已装可跳过）：
   ```bash
   npm i -g wrangler
   wrangler login
   ```
2. 改 `wrangler.toml` 里的 `bucket_name`，换成你 R2 的 bucket 名。
3. 在本目录部署：
   ```bash
   cd worker
   wrangler deploy
   ```
   部署完会打印一个地址，形如 `https://wixi-photos.<你的子域>.workers.dev`。

## 接到网站

把上面的地址配成前端的 `VITE_PHOTOS_API`：

- **本地预览**：在项目根目录建 `.env.local`，写一行
  ```
  VITE_PHOTOS_API=https://wixi-photos.xxx.workers.dev
  ```
- **线上（GitHub Pages）**：仓库 Settings → Secrets and variables → Actions → **Variables**
  新增 `VITE_PHOTOS_API`，值填同一个地址。部署流程已经会读取它。

留空时网站只用本地图 + `content/photos/*.txt`，不会报错。

## 日常使用

往 R2 按 `城市slug/文件名` 上传图片即可（如 `nanjing/IMG_2605.jpeg`），网站自动收录，
最多 1 分钟（CDN 缓存）出现。想自定义某张的图说，仍可在 `content/photos/<slug>.txt`
写 `文件名 | 图说`，会和自动清单合并去重。

## 可选：用自定义域

想用 `https://api.wixi88.xyz/photos` 这类地址，可在 Cloudflare 控制台给该 Worker 加一条
自定义域 / 路由，再把 `VITE_PHOTOS_API` 换成它即可。
