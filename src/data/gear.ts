export type GearCategory = 'body' | 'lens' | 'accessory'

export type GearItem = {
  id: string
  category: GearCategory
  brand: string
  name: string
  alias?: string
  acquiredAt?: string
  cover: string
  spec: { label: string; value: string }[]
  blurb: string
  story: string
  tags?: string[]
}

export const categoryMeta: Record<GearCategory, { label: string; en: string; tint: string }> = {
  body: { label: '机身', en: 'body', tint: 'text-coral-500' },
  lens: { label: '镜头', en: 'lens', tint: 'text-sage-500' },
  accessory: { label: '配件', en: 'accessory', tint: 'text-ink-700' },
}

/** 图片加载失败时的兜底封面 */
export const GEAR_FALLBACK_COVER =
  'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=1400&q=80'

export const gear: GearItem[] = [
  {
    id: 'nikon-z5',
    category: 'body',
    brand: 'Nikon',
    name: 'Z5',
    alias: '主力机',
    acquiredAt: '2024',
    // 真机图：Nikon Z5 + Z 24-50mm（Wikimedia Commons, 摄 Henry Söderlund, CC BY 4.0）
    // 已下载到本地 public/gear/，避免外链失效
    cover: '/gear/nikon-z5.jpg',
    spec: [
      { label: '类型', value: '全画幅无反' },
      { label: '传感器', value: 'CMOS · 24.3MP' },
      { label: '机身防抖', value: '5 轴 5 档' },
      { label: '入手', value: '2024' },
    ],
    blurb: '一台被低估的入门全画幅, 不快但够稳, 颜色讨人喜欢。',
    story:
      '挑它纯粹因为预算 + 全画幅。用下来发现它的"慢"反而让我学会想清楚再按快门, 防抖也救过不少手持夜景。它陪我从义乌走到深圳, 也跟着我去过大阪。',
    tags: ['全画幅', '无反', '主力'],
  },
  {
    id: 'viltrox-85-f18',
    category: 'lens',
    brand: 'Viltrox 唯卓仕',
    name: 'AF 85mm F1.8 Z',
    alias: '人像头',
    acquiredAt: '2024',
    // 原 Unsplash 图已失效，改用已下载到本地的图片
    cover: '/gear/viltrox-85-f18.jpg',
    spec: [
      { label: '焦段', value: '85mm 定焦' },
      { label: '光圈', value: 'F1.8' },
      { label: '卡口', value: 'Nikon Z' },
      { label: '约重', value: '484g' },
    ],
    blurb: '副厂里少有的香——锐度在线, 焦外柔和, 价格还不咬人。',
    story:
      '本来在原厂 85 1.8 S 和它之间纠结过很久, 最后选了便宜一半的它。事实证明对我这种业余玩家完全够用, 拍朋友、拍街头人物都很稳。',
    tags: ['定焦', '人像'],
  },
  {
    id: 'nikkor-24-50',
    category: 'lens',
    brand: 'Nikon',
    name: 'NIKKOR Z 24-50mm F4-6.3',
    alias: '挂机头',
    acquiredAt: '2024',
    // 已下载到本地 public/gear/，避免外链失效
    cover: '/gear/nikkor-24-50.jpg',
    spec: [
      { label: '焦段', value: '24-50mm 变焦' },
      { label: '光圈', value: 'F4-6.3' },
      { label: '卡口', value: 'Nikon Z' },
      { label: '约重', value: '195g' },
    ],
    blurb: '轻得像没装镜头, 装在 Z5 上整套不到 800g, 出门毫无负担。',
    story:
      '当年带 Z5 一起的套头, 一直没卖。变焦比想象中实用, 24 端拍风景, 50 端拍特写, 出去玩一镜走天下。光圈是慢了点, 但白天足够。',
    tags: ['变焦', '挂机', '轻便'],
  },
]
