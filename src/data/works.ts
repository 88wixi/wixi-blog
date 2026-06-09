export type WorkCategory = 'web' | 'ai' | 'tool'

export type WorkStatus = 'live' | 'wip' | 'archived'

export type Work = {
  id: string
  category: WorkCategory
  title: string
  /** 一句话副标题 */
  tagline: string
  year: string
  status: WorkStatus
  cover: string
  /** 项目里我做了什么、解决了什么 */
  summary: string
  /** 技术栈 */
  stack: string[]
  /** 我在其中扮演的角色 */
  role: string
  links?: { label: string; href: string }[]
  /** 设为 true 会在页面上更突出地展示 */
  featured?: boolean
}

export const WORK_FALLBACK_COVER =
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'

export const categoryMeta: Record<
  WorkCategory,
  { label: string; en: string; tint: string; badge: string }
> = {
  web: { label: '网站 / 前端', en: 'web', tint: 'text-coral-500', badge: 'bg-coral-100 text-coral-600' },
  ai: { label: 'AI 应用', en: 'ai', tint: 'text-sage-500', badge: 'bg-sage-100 text-sage-700' },
  tool: { label: '小工具', en: 'tool', tint: 'text-ink-700', badge: 'bg-paper-200 text-ink-700' },
}

export const statusMeta: Record<WorkStatus, { label: string; dot: string }> = {
  live: { label: '已上线', dot: 'bg-sage-500' },
  wip: { label: '开发中', dot: 'bg-coral-500' },
  archived: { label: '已归档', dot: 'bg-ink-300' },
}

export const works: Work[] = [
  {
    id: 'forest-notes',
    category: 'web',
    title: 'wixi 的林间小记',
    tagline: '你现在正在看的这片林子',
    year: '2026',
    status: 'live',
    featured: true,
    cover:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    summary:
      '一个安静、克制的个人博客。自己设计版式与配色，从开屏信封、滚动揭示动画到行迹地图都手写实现，用来安放技术札记、照片和旅行记录。',
    stack: ['React 19', 'TypeScript', 'Vite', 'Tailwind v4', 'Leaflet'],
    role: '独立设计 + 开发',
    links: [
      { label: '源码', href: 'https://github.com/88wixi' },
    ],
  },
  {
    id: 'ai-agent-app',
    category: 'ai',
    title: 'AI 应用 / Agent 实践',
    tagline: '在制造业场景里把大模型用起来',
    year: '2026',
    status: 'wip',
    featured: true,
    cover:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    summary:
      '在深圳一家制造业公司做 AI 应用开发：把大模型、检索增强和工具调用接进真实业务流程，让一线同事真的能用上，而不是停在 demo。',
    stack: ['LLM', 'RAG', 'Agent', 'Python', 'Prompt 工程'],
    role: 'AI 应用开发工程师',
  },
  {
    id: 'trade-fullstack',
    category: 'web',
    title: '外贸业务系统',
    tagline: '一个人扛起前后端的真实项目',
    year: '2024',
    status: 'archived',
    cover:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    summary:
      '从实习生到转正期间独立负责的外贸项目，前端 React、后端 Laravel/PHP，从需求到上线一路啃下来，也是我长成"半个全栈"的地方。',
    stack: ['React', 'Laravel', 'PHP', 'MySQL'],
    role: '前端为主 + 部分后端',
  },
]
