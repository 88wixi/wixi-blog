export type Category = 'life' | 'tech' | 'writing' | 'observation'

export type Article = {
  slug: string
  title: string
  date: string
  excerpt: string
  category: Category
  tags: string[]
  readingMinutes: number
  content: string[]
}

export const categoryMeta: Record<Category, { label: string; badge: string }> = {
  life: {
    label: '生活设计',
    badge: 'bg-coral-100 text-coral-600',
  },
  tech: {
    label: '前端札记',
    badge: 'bg-sage-100 text-sage-700',
  },
  writing: {
    label: '写作',
    badge: 'bg-paper-200 text-ink-700',
  },
  observation: {
    label: '观察',
    badge: 'bg-ink-900/90 text-paper-50',
  },
}

export const articles: Article[] = [
  {
    slug: 'first-note',
    title: '第一篇小记：把博客搬到这片林子里',
    date: '2026-05-20',
    category: 'writing',
    tags: ['杂记', '生活'],
    readingMinutes: 4,
    excerpt: '搭一个属于自己的、安静的角落，把那些没地方放的句子放进来。',
    content: [
      '过去一年里，我陆陆续续在不同的平台写过一些东西，但总觉得它们像是寄居在别人家的客厅里。',
      '于是有了这片林子。它不需要算法，不需要流量，只要一盏暖灯、几把椅子，够我自己坐下来就好。',
      '欢迎你偶尔路过，在这儿喘口气，翻一翻那些被我顺手放在桌上的小本子。',
    ],
  },
  {
    slug: 'weekend-slow-variable',
    title: '把一个周末留给慢变量',
    date: '2026-05-08',
    category: 'life',
    tags: ['生活', '系统'],
    readingMinutes: 6,
    excerpt: '写给自己的一份系统整理：少一点即时回应，多一点长期生长。',
    content: [
      '一天里大部分变化都是即时的：消息、提醒、任务的状态翻转。',
      '但真正决定生活走向的，是那些慢慢变化的东西——身体、关系、技艺、储蓄、阅读量。',
      '所以我开始有意识地把一个周末完全留给"慢变量"：散步、做饭、读完一本书、给一段代码做小重构。',
    ],
  },
  {
    slug: 'react-component-boundaries',
    title: 'React 组件为什么需要边界感',
    date: '2026-04-22',
    category: 'tech',
    tags: ['React', '工程'],
    readingMinutes: 8,
    excerpt: '从一个博客卡片开始，聊聊状态、布局和可维护性的分寸。',
    content: [
      '"组件应该多大"是个老问题，今天换个角度：从"边界"看。',
      '一个组件的边界，由它对父级暴露的 props 和它私有的状态共同定义。',
      '边界感不是越细越好，而是让每一处变化都落在它最自然的位置上。',
    ],
  },
  {
    slug: 'walking-in-hangzhou',
    title: '杭州的春天，走在落樱里',
    date: '2026-04-08',
    category: 'observation',
    tags: ['城市', '杭州'],
    readingMinutes: 5,
    excerpt: '四月初的杭州像一张被打湿的水彩纸，颜色都晕开了。',
    content: [
      '从苏堤一直走到杨公堤，风把樱花瓣吹到肩膀上，像一种轻轻的拍打。',
      '路过一家小书店，店主在门口烤红薯。我买了一个，坐在台阶上慢慢吃完。',
      '回来的路上下了点雨。湖面被打出无数细小的圈，然后又恢复平静。',
    ],
  },
  {
    slug: 'on-slow-software',
    title: '关于"慢软件"的一些想法',
    date: '2026-03-15',
    category: 'tech',
    tags: ['工具', '思考'],
    readingMinutes: 7,
    excerpt: '不是所有工具都需要追求"快"。有些工具更适合像泡茶一样慢慢用。',
    content: [
      '最近开始重新喜欢一些"慢"的工具：纸质笔记本、机械键盘、本地优先的笔记软件。',
      '它们都不是最高效的选择，但用它们的过程本身，会让人慢下来，把注意力还给手上的事情。',
      '我想做的产品，大概也是这一类。不抢用户的时间，只在他需要时安静地在场。',
    ],
  },
  {
    slug: 'cloud-watching',
    title: '抬头看云这件小事',
    date: '2026-02-28',
    category: 'observation',
    tags: ['日常'],
    readingMinutes: 3,
    excerpt: '云不解释什么，它只是路过。看着看着，一些紧绷的东西就松开了。',
    content: [
      '我有一个不太起眼的爱好：在通勤的路上抬头看云。',
      '云的形状每分钟都在变，但它从不解释。它只是路过。',
      '看着看着，我会觉得，有些事其实没必要立刻有结论。',
    ],
  },
]
