export type Category = 'life' | 'tech' | 'writing' | 'observation'

export type Article = {
  slug: string
  title: string
  date: string
  excerpt: string
  category: Category
  tags: string[]
  readingMinutes: number
  /** 正文（原始 Markdown，由 ArticleDetail 渲染） */
  content: string
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

/**
 * 极简 YAML frontmatter 解析。仅支持本博客用到的写法：
 *   key: 标量
 *   tags: [a, b, c]
 * 数组也支持多行 `- item` 形式。正文里出现的 `---` 不受影响——
 * 只解析文件开头第一段被 `---` 包裹的块。
 */
const parseFrontmatter = (raw: string): { data: Record<string, unknown>; body: string } => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!match) return { data: {}, body: raw.trim() }

  const data: Record<string, unknown> = {}
  let currentKey: string | null = null

  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue

    // 多行数组项： "  - 值"
    const listItem = /^\s*-\s+(.*)$/.exec(line)
    if (listItem && currentKey) {
      ;(data[currentKey] as string[]).push(stripQuotes(listItem[1].trim()))
      continue
    }

    const kv = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line)
    if (!kv) continue
    const [, key, rawValue] = kv
    const value = rawValue.trim()

    if (value === '') {
      // 紧随其后的 `- item` 多行数组
      data[key] = []
      currentKey = key
    } else if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => stripQuotes(s.trim()))
        .filter(Boolean)
      currentKey = null
    } else {
      data[key] = stripQuotes(value)
      currentKey = null
    }
  }

  return { data, body: match[2].trim() }
}

const stripQuotes = (s: string) =>
  (s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))
    ? s.slice(1, -1)
    : s

// 构建时把 content/articles 下的 Markdown 原文内联进包。
const modules = import.meta.glob<string>('../../content/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const toArticle = (path: string, raw: string): Article => {
  const { data, body } = parseFrontmatter(raw)
  const fallbackSlug = path.split('/').pop()!.replace(/\.md$/, '')
  return {
    slug: String(data.slug ?? fallbackSlug),
    title: String(data.title ?? fallbackSlug),
    date: String(data.date ?? ''),
    excerpt: String(data.excerpt ?? ''),
    category: (data.category as Category) ?? 'writing',
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    readingMinutes: Number(data.readingMinutes ?? 1),
    content: body,
  }
}

export const articles: Article[] = Object.entries(modules)
  .map(([path, raw]) => toArticle(path, raw))
  .sort((a, b) => (a.date < b.date ? 1 : -1))
