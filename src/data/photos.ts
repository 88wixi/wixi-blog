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
  photos: Photo[]
}

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const cities: City[] = [
  {
    slug: 'hangzhou',
    name: '杭州',
    region: '浙江',
    description: '湖、山、雨、桂花的城市。',
    cover: u('1528127269322-539801943592'),
    photos: [
      { id: 'hz-1', caption: '苏堤春晓', src: u('1528127269322-539801943592'), date: '2026-04-08' },
      { id: 'hz-2', caption: '西湖一隅', src: u('1503899036084-c55cdd92da26'), date: '2026-04-08' },
      { id: 'hz-3', caption: '雨中的伞', src: u('1493663284031-b7e3aefcae8e'), date: '2026-04-10' },
    ],
  },
  {
    slug: 'chengdu',
    name: '成都',
    region: '四川',
    description: '在巷子里闻见花椒和茉莉。',
    cover: u('1545569341-9eb8b30979d9'),
    photos: [
      { id: 'cd-1', caption: '宽窄巷子', src: u('1545569341-9eb8b30979d9'), date: '2026-02-14' },
      { id: 'cd-2', caption: '茶馆下午', src: u('1528459801416-a9e53bbf4e17'), date: '2026-02-15' },
      { id: 'cd-3', caption: '夜市', src: u('1480714378408-67cf0d13bc1b'), date: '2026-02-16' },
    ],
  },
  {
    slug: 'tokyo',
    name: '东京',
    region: '日本',
    description: '走过涩谷,也躲进神乐坂的小巷。',
    cover: u('1540959733332-eab4deabeeaf'),
    photos: [
      { id: 'tk-1', caption: '涩谷十字', src: u('1540959733332-eab4deabeeaf'), date: '2025-11-02' },
      { id: 'tk-2', caption: '便利店的灯', src: u('1492571350019-22de08371fd3'), date: '2025-11-03' },
      { id: 'tk-3', caption: '电车窗外', src: u('1554797589-7241bb691973'), date: '2025-11-05' },
    ],
  },
  {
    slug: 'dali',
    name: '大理',
    region: '云南',
    description: '风很大,云走得很慢。',
    cover: u('1528127269322-539801943592'),
    photos: [
      { id: 'dl-1', caption: '洱海的早晨', src: u('1502786129293-79981df4e689'), date: '2025-09-12' },
      { id: 'dl-2', caption: '苍山脚下', src: u('1464822759023-fed622ff2c3b'), date: '2025-09-13' },
    ],
  },
]
