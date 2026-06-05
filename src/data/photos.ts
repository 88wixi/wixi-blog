export type Photo = {
  id: string
  caption: string
  src: string
  date?: string
}

export type City = {
  slug: string
  name: string
  region: string
  description: string
  cover: string
  /** 用于旅行地图的经纬度 [lat, lng] */
  coords: [number, number]
  photos: Photo[]
}

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const cities: City[] = [
  {
    slug: 'shenzhen',
    name: '深圳',
    region: '广东',
    description: '现在生活的城市。地铁很长, 写字楼很高, 公园也意外地多。',
    cover: u('1567604130959-7ea7ab2a7e76'),
    coords: [22.5431, 114.0579],
    photos: [
      { id: 'sz-1', caption: '南山区夜景', src: u('1567604130959-7ea7ab2a7e76'), date: '2026-05-22' },
      { id: 'sz-2', caption: '深圳湾散步', src: u('1499856871958-5b9627545d1a'), date: '2026-05-25' },
      { id: 'sz-3', caption: '楼与楼之间', src: u('1500382017468-9049fed747ef'), date: '2026-06-01' },
    ],
  },
  {
    slug: 'guangzhou',
    name: '广州',
    region: '广东',
    description: '老骑楼、糖水铺、珠江晚风。',
    cover: u('1583308148978-5e3a59c5d4ad'),
    coords: [23.1291, 113.2644],
    photos: [
      { id: 'gz-1', caption: '永庆坊', src: u('1583308148978-5e3a59c5d4ad'), date: '2026-03-18' },
      { id: 'gz-2', caption: '珠江夜', src: u('1531986362847-be1ad2747f9c'), date: '2026-03-19' },
    ],
  },
  {
    slug: 'hangzhou',
    name: '杭州',
    region: '浙江',
    description: '湖、山、雨、桂花的城市。',
    cover: u('1528127269322-539801943592'),
    coords: [30.2741, 120.1551],
    photos: [
      { id: 'hz-1', caption: '苏堤春晓', src: u('1528127269322-539801943592'), date: '2026-04-08' },
      { id: 'hz-2', caption: '西湖一隅', src: u('1503899036084-c55cdd92da26'), date: '2026-04-08' },
      { id: 'hz-3', caption: '雨中的伞', src: u('1493663284031-b7e3aefcae8e'), date: '2026-04-10' },
    ],
  },
  {
    slug: 'jiaxing',
    name: '嘉兴',
    region: '浙江',
    description: '南湖、月河, 一个不慌不忙的小城。',
    cover: u('1531971589569-0d9370cbe1e5'),
    coords: [30.7521, 120.7503],
    photos: [
      { id: 'jx-1', caption: '月河老街', src: u('1531971589569-0d9370cbe1e5'), date: '2025-12-20' },
      { id: 'jx-2', caption: '南湖烟雨楼', src: u('1531805411-b8c2275cba78'), date: '2025-12-21' },
    ],
  },
  {
    slug: 'suzhou',
    name: '苏州',
    region: '江苏',
    description: '园林是慢的, 评弹是慢的, 连糖醋小排都是慢的。',
    cover: u('1532299033008-2cb3ccff5e4f'),
    coords: [31.2989, 120.5853],
    photos: [
      { id: 'sz2-1', caption: '拙政园一角', src: u('1532299033008-2cb3ccff5e4f'), date: '2025-11-10' },
      { id: 'sz2-2', caption: '平江路的灯', src: u('1573497019418-b400bb3ab074'), date: '2025-11-11' },
    ],
  },
  {
    slug: 'wenzhou',
    name: '温州',
    region: '浙江',
    description: '海腥味和山雾, 总在同一座城里相遇。',
    cover: u('1559664729-c2b3c8da7d72'),
    coords: [27.9939, 120.6987],
    photos: [
      { id: 'wz-1', caption: '江心屿', src: u('1559664729-c2b3c8da7d72'), date: '2025-10-25' },
      { id: 'wz-2', caption: '楠溪江', src: u('1571115764595-644a1f56a55c'), date: '2025-10-26' },
    ],
  },
  {
    slug: 'quzhou',
    name: '衢州',
    region: '浙江',
    description: '四省通衢的小城, 米粉好吃。',
    cover: u('1545079968-1feb95494244'),
    coords: [28.97, 118.87],
    photos: [
      { id: 'qz-1', caption: '南宗孔庙', src: u('1545079968-1feb95494244'), date: '2025-09-30' },
      { id: 'qz-2', caption: '烂柯山', src: u('1551041777-ed1f7494b461'), date: '2025-10-01' },
    ],
  },
  {
    slug: 'chongqing',
    name: '重庆',
    region: '直辖市',
    description: '8D 魔幻立体, 桥上一层桥下一层, 江风带着火锅味。',
    cover: u('1581328814761-7fcdc23f3727'),
    coords: [29.563, 106.5516],
    photos: [
      { id: 'cq-1', caption: '洪崖洞夜色', src: u('1581328814761-7fcdc23f3727'), date: '2025-10-04' },
      { id: 'cq-2', caption: '索道上的两江', src: u('1605101100278-5d1deb2b6498'), date: '2025-10-05' },
      { id: 'cq-3', caption: '弯弯绕绕的轻轨', src: u('1486325212027-8081e485255e'), date: '2025-10-06' },
    ],
  },
  {
    slug: 'guilin',
    name: '桂林',
    region: '广西',
    description: '漓江的水是绿的, 山是站着的水墨。',
    cover: u('1545079968-1feb95494244'),
    coords: [25.2736, 110.29],
    photos: [
      { id: 'gl-1', caption: '漓江清晨', src: u('1545079968-1feb95494244'), date: '2025-08-12' },
      { id: 'gl-2', caption: '阳朔西街', src: u('1551041777-ed1f7494b461'), date: '2025-08-13' },
      { id: 'gl-3', caption: '兴坪的山', src: u('1528127269322-539801943592'), date: '2025-08-14' },
    ],
  },
  {
    slug: 'osaka',
    name: '大阪',
    region: '日本',
    description: '通天阁下的小吃街, 道顿堀的霓虹永远在亮。',
    cover: u('1590559899731-a382839e5549'),
    coords: [34.6937, 135.5023],
    photos: [
      { id: 'os-1', caption: '道顿堀夜', src: u('1590559899731-a382839e5549'), date: '2025-05-02' },
      { id: 'os-2', caption: '心斋桥', src: u('1542931287-023b922fa89b'), date: '2025-05-03' },
      { id: 'os-3', caption: '大阪城的樱', src: u('1528360983277-13d401cdc186'), date: '2025-05-04' },
    ],
  },
]
