# 城市照片外链

每座城市一个 `<城市slug>.txt`，**一行一个图片**，批量贴就行，不用改任何代码。

图床基址是 Cloudflare R2 自定义域 `https://img.wixi88.xyz`（在 `src/data/photos.ts`
的 `R2_BASE` 改）。文件按城市分文件夹放，即 `https://img.wixi88.xyz/<slug>/<文件名>`。

城市的 slug 见 `src/data/photos.ts`（如深圳是 `shenzhen`、南京是 `nanjing`）。
例如新建 `nanjing.txt`：

```
# 以 # 开头的行、空行都会被忽略，可以拿来分组或写备注
IMG_2605.jpeg                       # 只写文件名 → 拼成 .../nanjing/IMG_2605.jpeg
IMG_2606.jpeg | 中山陵的台阶          # 用 | 在后面加自定义图说
/banner/top.jpg                     # 以 / 开头 → 拼到 img.wixi88.xyz 根目录下
https://另一个图床.com/x.jpg          # 完整 http(s) 链接 → 原样使用
```

要点：

- 平时只需写文件名，前缀 `https://img.wixi88.xyz/<slug>/` 会自动补上。
- 不写 `| 图说` 时，从文件名推断；相机默认名（IMG_xxxx 等）则配「城市 · 序号」。
- 这些 `.txt` 只存文字，**图片本身在 R2，不进仓库**，所以仓库永远很小。
- 也可以继续用本地文件夹 `src/assets/photos/<slug>/`（少量、压缩过的图）；两种来源会自动合并，本地图在前。
- 列表页 / 相册页都做了懒加载并预留占位高度，打开页面不会一次性把所有图拉满，滚动到附近才加载。
- 上传 R2 前记得先压缩到网页尺寸（宽 ~1600px、webp/jpeg、200~400KB）。
