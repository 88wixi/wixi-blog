export type Photo = {
  id: string
  caption: string
  src: string
}

export type City = {
  slug: string
  name: string
  region: string
  description: string
  /** 用于旅行地图的经纬度 [lat, lng] */
  coords: [number, number]
  /** 封面：取该城文件夹里的第一张；没有图片时为 undefined（页面显示占位） */
  cover?: string
  photos: Photo[]
}

/**
 * 一座城市的照片有两种来源，可以混用，也可只用一种：
 *
 * 1) 本地文件夹（自动）：把图片丢进 src/assets/photos/<slug>/ 即可被收录。
 *    适合少量、已压缩过的图——注意这些图会进 git 仓库。
 *
 * 2) 外链（推荐放大量 / 高清图，例如 Cloudflare R2）：在 content/photos/<slug>.txt
 *    里一行写一个图片，批量粘贴即可，不用碰这里的代码。每行可以是：
 *      IMG_2605.jpeg                 # 只写文件名 → 自动拼成 R2_BASE/<slug>/文件名
 *      IMG_2606.jpeg | 中山陵的台阶   # 用 | 加自定义图说
 *      /other/banner.jpg             # 以 / 开头 → 拼到 R2_BASE 根下
 *      https://另一图床.com/x.jpg     # 完整 http(s) 链接 → 原样使用
 *      # 以 # 开头的行、空行都会被忽略
 *
 * 合并顺序：本地图在前、外链在后；封面取合并后的第一张。
 */

// Cloudflare R2 自定义域：txt 里只写文件名时，按 R2_BASE/<slug>/文件名 拼出完整地址
const R2_BASE = 'https://img.wixi88.xyz'
const resolveSrc = (raw: string, slug: string): string =>
  /^https?:\/\//i.test(raw)
    ? raw
    : raw.startsWith('/')
      ? `${R2_BASE}${raw}`
      : `${R2_BASE}/${slug}/${raw}`

// 本地：src/assets/photos/<slug>/* —— slug -> [{ file, url }]，按文件名排序
const modules = import.meta.glob(
  '../assets/photos/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

const byCity: Record<string, { file: string; url: string }[]> = {}
for (const [path, url] of Object.entries(modules)) {
  const m = path.match(/\/photos\/([^/]+)\/([^/]+)$/)
  if (!m) continue
  const [, slug, file] = m
  ;(byCity[slug] ??= []).push({ file, url })
}
for (const slug of Object.keys(byCity)) {
  byCity[slug].sort((a, b) => a.file.localeCompare(b.file, 'zh'))
}

// 外链：content/photos/<slug>.txt —— 一行一个 URL，可选 “URL | 图说”
const remoteFiles = import.meta.glob('../../content/photos/*.txt', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const remoteByCity: Record<string, { src: string; caption?: string; file?: string }[]> = {}
for (const [path, text] of Object.entries(remoteFiles)) {
  const slug = path.match(/\/([^/]+)\.txt$/)?.[1]
  if (!slug) continue
  remoteByCity[slug] = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const i = line.indexOf('|')
      const raw = (i === -1 ? line : line.slice(0, i)).trim()
      const caption = i === -1 ? undefined : line.slice(i + 1).trim() || undefined
      // file 取地址最后一段，供没写图说时从文件名推断标题
      return { src: resolveSrc(raw, slug), caption, file: raw.split('/').pop() || undefined }
    })
}

// 从文件名推断标题：去扩展名、去掉用于排序的数字前缀（01- / 02_ 等）；
// 相机默认名（IMG_xxxx、DSC0001、纯数字）则回退为「城市 · 序号」
const captionFrom = (file: string, cityName: string, index: number): string => {
  const base = file
    .replace(/\.[^.]+$/, '')
    .replace(/^\d+[-_.\s]*/, '')
    .trim()
  const isCameraName = base === '' || /^(img|dsc|photo|p|mvimg)[-_]?\d+$/i.test(base) || /^\d{3,}$/.test(base)
  if (isCameraName) return `${cityName} · ${String(index + 1).padStart(2, '0')}`
  return base.replace(/[-_]+/g, ' ')
}

const buildPhotos = (slug: string, cityName: string): Photo[] => {
  const local = (byCity[slug] ?? []).map((item) => ({ src: item.url, file: item.file }))
  const remote = remoteByCity[slug] ?? []
  return [...local, ...remote].map((item, i) => {
    const custom = 'caption' in item ? item.caption : undefined
    const file = 'file' in item ? item.file : undefined
    return {
      id: `${slug}-${i}`,
      src: item.src,
      caption:
        custom ?? (file ? captionFrom(file, cityName, i) : `${cityName} · ${String(i + 1).padStart(2, '0')}`),
    }
  })
}

// 城市元数据（名字 / 地区 / 描述 / 坐标），照片由文件夹 + content/photos/<slug>.txt 自动注入
const meta: Omit<City, 'photos' | 'cover'>[] = [
  { slug: 'shenzhen', name: '深圳', region: '广东', description: '现在生活的城市。地铁很长, 写字楼很高, 公园也意外地多。', coords: [22.5431, 114.0579] },
  { slug: 'guangzhou', name: '广州', region: '广东', description: '老骑楼、糖水铺、珠江晚风。', coords: [23.1291, 113.2644] },
  { slug: 'hangzhou', name: '杭州', region: '浙江', description: '湖、山、雨、桂花的城市。', coords: [30.2741, 120.1551] },
  { slug: 'jiaxing', name: '嘉兴', region: '浙江', description: '南湖、月河, 一个不慌不忙的小城。', coords: [30.7521, 120.7503] },
  { slug: 'shaoxing', name: '绍兴', region: '浙江', description: '乌篷船、黄酒、茴香豆, 鲁迅笔下的水乡旧巷。', coords: [30.0023, 120.581] },
  { slug: 'suzhou', name: '苏州', region: '江苏', description: '园林是慢的, 评弹是慢的, 连糖醋小排都是慢的。', coords: [31.2989, 120.5853] },
  { slug: 'nanjing', name: '南京', region: '江苏', description: '梧桐、城墙、民国旧梦, 处处是六朝烟水气。', coords: [32.0603, 118.7969] },
  { slug: 'wenzhou', name: '温州', region: '浙江', description: '海腥味和山雾, 总在同一座城里相遇。', coords: [27.9939, 120.6987] },
  { slug: 'taizhou', name: '台州', region: '浙江', description: '山海之间, 临海古城墙下一碗姜汤面。', coords: [28.656, 121.4206] },
  { slug: 'jinhua', name: '金华', region: '浙江', description: '婺江穿城而过, 火腿与酥饼的香。', coords: [29.0784, 119.6474] },
  { slug: 'yiwu', name: '义乌', region: '浙江', description: '全世界的小商品都在这里集散, 街头能听见各国口音。', coords: [29.3068, 120.0744] },
  { slug: 'quzhou', name: '衢州', region: '浙江', description: '四省通衢的小城, 米粉好吃。', coords: [28.97, 118.87] },
  { slug: 'chongqing', name: '重庆', region: '直辖市', description: '8D 魔幻立体, 桥上一层桥下一层, 江风带着火锅味。', coords: [29.563, 106.5516] },
  { slug: 'guilin', name: '桂林', region: '广西', description: '漓江的水是绿的, 山是站着的水墨。', coords: [25.2736, 110.29] },
  { slug: 'osaka', name: '大阪', region: '日本', description: '通天阁下的小吃街, 道顿堀的霓虹永远在亮。', coords: [34.6937, 135.5023] },
]

export const cities: City[] = meta.map((c) => {
  const photos = buildPhotos(c.slug, c.name)
  return { ...c, photos, cover: photos[0]?.src }
})
