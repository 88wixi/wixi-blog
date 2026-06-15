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
  /** 封面：取该城的第一张；没有图片时为 undefined（页面显示占位） */
  cover?: string
  photos: Photo[]
}

/**
 * 照片全部来自 Cloudflare R2：按「城市文件夹/文件名」上传到 bucket，
 * Worker（VITE_PHOTOS_API）运行时列出清单，前端按下面的地址加载。
 * 往 R2 加图即时生效，不用改代码、不用重新部署网站。
 */

// Cloudflare R2 自定义域：原图按 R2_BASE/<slug>/<文件名> 提供
const R2_BASE = 'https://img.wixi88.xyz'

const originalSrc = (slug: string, file: string): string => `${R2_BASE}/${slug}/${file}`

/**
 * 缩略图地址：走 Cloudflare 图片变换（cdn-cgi/image），把几 MB 原图现切成几十 KB 小图，
 * 列表/相册用它，原图只在灯箱里加载。
 * 需要在 Cloudflare 控制台给 wixi88.xyz 开启 Transformations；未开启时前端 onError 会
 * 回退到原图，不会坏图。传入完整 R2 原图 URL，返回对应宽度的缩略图 URL；非 R2 链接原样返回。
 */
export const thumb = (src: string, width = 600): string => {
  const prefix = `${R2_BASE}/`
  if (!src.startsWith(prefix) || src.includes('/cdn-cgi/')) return src
  return `${R2_BASE}/cdn-cgi/image/width=${width},quality=78,format=auto/${src.slice(prefix.length)}`
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

const buildPhotos = (slug: string, cityName: string, files: string[] = []): Photo[] =>
  files.map((file, i) => ({
    id: `${slug}-${i}`,
    src: originalSrc(slug, file),
    caption: captionFrom(file, cityName, i),
  }))

// 城市元数据（名字 / 地区 / 描述 / 坐标），照片由 R2 清单运行时注入
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

/** R2 自动清单：slug -> 文件名数组（由 Worker 返回）。传入后并入对应城市的照片。 */
export type R2Manifest = Record<string, string[]>

export const buildCities = (r2: R2Manifest = {}): City[] =>
  meta.map((c) => {
    const photos = buildPhotos(c.slug, c.name, r2[c.slug] ?? [])
    return { ...c, photos, cover: photos[0]?.src }
  })

// 静态城市：仅含元数据、照片为空，作为首屏 / Worker 未就绪时的占位；R2 清单到达后替换
export const cities: City[] = buildCities()

/**
 * 列图接口地址：默认用 photos.wixi88.xyz（Worker 自定义域，国内外都可访问，公开地址非密钥）。
 * 想换地址可用 VITE_PHOTOS_API 覆盖；workers.dev 在国内被墙，别用它当默认。
 */
export const PHOTOS_API: string = import.meta.env.VITE_PHOTOS_API || 'https://photos.wixi88.xyz'

/** 运行时拉取 R2 清单；失败 / 未配置都返回 null，调用方退回静态数据。 */
export const fetchManifest = async (): Promise<R2Manifest | null> => {
  if (!PHOTOS_API) return null
  try {
    const res = await fetch(PHOTOS_API, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return (await res.json()) as R2Manifest
  } catch {
    return null
  }
}
