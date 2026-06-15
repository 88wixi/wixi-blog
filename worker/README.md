# 照片清单 Worker

一个极小的 Cloudflare Worker，绑定你的 R2 bucket，把里面的图片按「顶层文件夹(=城市 slug)」
分组成 JSON 返回。前端运行时拉一次，上传新图即时显示，**不用改代码、也不用重新部署网站**。

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

前端默认就用自定义域 `https://photos.wixi88.xyz`（见 `src/data/photos.ts` 的 `PHOTOS_API`），
本仓库的 Worker 已通过 `wrangler.toml` 的 `[[routes]]` 绑定该域，**通常不用再配任何变量**。

- **想换接口地址**：用 `VITE_PHOTOS_API` 覆盖默认值。本地预览在项目根目录建 `.env.local`：
  ```
  VITE_PHOTOS_API=https://photos.wixi88.xyz
  ```
- ⚠️ **不要**把 `*.workers.dev` 地址配成线上构建变量（GitHub Actions Variables / Vercel 环境变量）。
  `workers.dev` 在国内被墙，配上会覆盖默认的自定义域，导致国内拉不到照片清单、整页不出图。
  两边 CI 都已刻意不注入这个变量。

接口未配置 / 拉取失败时，前端退回空的静态城市数据（显示「整理中」占位），不会报错。

## 日常使用

往 R2 按 `城市slug/文件名` 上传图片即可（如 `nanjing/IMG_2605.jpeg`），网站自动收录，
最多 1 分钟（CDN 缓存）出现。照片标题由文件名自动推断（相机默认名回退为「城市 · 序号」）。

## 缩略图（Cloudflare 图片变换）

列表/相册用 `https://img.wixi88.xyz/cdn-cgi/image/...` 现切缩略图，原图只在灯箱加载。
需在 Cloudflare 控制台给 `wixi88.xyz` 这个 zone 开启 **Images → Transformations**
（免费额度 5000 个唯一变换/月，结果会缓存，与访问量无关）。未开启时前端会回退到原图，不会坏图。

## 自定义域（已配置）

`wrangler.toml` 里已用 `custom_domain` 把 Worker 绑到 `photos.wixi88.xyz`，`wrangler deploy`
会自动建好 DNS 与证书。换域名改 `[[routes]]` 的 `pattern` 即可。
