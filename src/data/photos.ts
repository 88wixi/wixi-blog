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
 * 自动读取每座城市文件夹下的所有图片：src/assets/photos/<slug>/*
 * 直接把图片丢进对应文件夹即可，无需在此登记文件名。
 * 想控制顺序就给文件名加前缀，如 01-xxx.jpg、02-xxx.jpg（按文件名升序）。
 */
const modules = import.meta.glob(
  '../assets/photos/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

// slug -> [{ file, url }]，按文件名排序
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

const buildPhotos = (slug: string, cityName: string): Photo[] =>
  (byCity[slug] ?? []).map((item, i) => ({
    id: `${slug}-${i}`,
    caption: captionFrom(item.file, cityName, i),
    src: item.url,
  }))

// 城市元数据（名字 / 地区 / 描述 / 坐标），照片由各自文件夹自动注入
const meta: Omit<City, 'photos' | 'cover'>[] = [
  { slug: 'shenzhen', name: '深圳', region: '广东', description: '现在生活的城市。地铁很长, 写字楼很高, 公园也意外地多。', coords: [22.5431, 114.0579] },
  { slug: 'guangzhou', name: '广州', region: '广东', description: '老骑楼、糖水铺、珠江晚风。', coords: [23.1291, 113.2644] },
  { slug: 'hangzhou', name: '杭州', region: '浙江', description: '湖、山、雨、桂花的城市。', coords: [30.2741, 120.1551] },
  { slug: 'jiaxing', name: '嘉兴', region: '浙江', description: '南湖、月河, 一个不慌不忙的小城。', coords: [30.7521, 120.7503] },
  { slug: 'suzhou', name: '苏州', region: '江苏', description: '园林是慢的, 评弹是慢的, 连糖醋小排都是慢的。', coords: [31.2989, 120.5853] },
  { slug: 'nanjing', name: '南京', region: '江苏', description: '梧桐、城墙、民国旧梦, 处处是六朝烟水气。', coords: [32.0603, 118.7969] },
  { slug: 'wenzhou', name: '温州', region: '浙江', description: '海腥味和山雾, 总在同一座城里相遇。', coords: [27.9939, 120.6987] },
  { slug: 'taizhou', name: '台州', region: '浙江', description: '山海之间, 临海古城墙下一碗姜汤面。', coords: [28.656, 121.4206] },
  { slug: 'jinhua', name: '金华', region: '浙江', description: '婺江穿城而过, 火腿与酥饼的香。', coords: [29.0784, 119.6474] },
  { slug: 'quzhou', name: '衢州', region: '浙江', description: '四省通衢的小城, 米粉好吃。', coords: [28.97, 118.87] },
  { slug: 'chongqing', name: '重庆', region: '直辖市', description: '8D 魔幻立体, 桥上一层桥下一层, 江风带着火锅味。', coords: [29.563, 106.5516] },
  { slug: 'guilin', name: '桂林', region: '广西', description: '漓江的水是绿的, 山是站着的水墨。', coords: [25.2736, 110.29] },
  { slug: 'osaka', name: '大阪', region: '日本', description: '通天阁下的小吃街, 道顿堀的霓虹永远在亮。', coords: [34.6937, 135.5023] },
]

export const cities: City[] = meta.map((c) => {
  const photos = buildPhotos(c.slug, c.name)
  return { ...c, photos, cover: photos[0]?.src }
})
