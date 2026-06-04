import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { articles, categoryMeta, type Category } from '../data/articles.ts'

const formatDate = (d: string) => {
  const date = new Date(d)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

type Filter = 'all' | Category

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'life', label: '生活设计' },
  { value: 'tech', label: '前端札记' },
  { value: 'writing', label: '写作' },
  { value: 'observation', label: '观察' },
]

const Articles = () => {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [filter])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...articles]
      .filter((a) => (filter === 'all' ? true : a.category === filter))
      .filter((a) =>
        q
          ? a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q))
          : true,
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [filter, query])

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-[0.3em] text-coral-500 uppercase">
            latest posts
          </p>
          <h1 className="font-serif text-4xl text-ink-900 sm:text-5xl">最近文章</h1>
          <p className="max-w-xl text-sm text-ink-500">
            一些日常的想法、读书笔记和路途上的小记。
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章、标签或摘要"
            className="w-full rounded-xl border border-paper-200 bg-paper-50 py-2.5 pl-10 pr-3 text-sm text-ink-900 placeholder:text-ink-500 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-400/20"
          />
        </div>
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.value
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={[
                'rounded-lg px-4 py-2 text-sm transition-colors',
                active
                  ? 'bg-ink-900 text-paper-50'
                  : 'border border-paper-200 bg-paper-50 text-ink-700 hover:border-ink-300',
              ].join(' ')}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-paper-200 bg-paper-100/40 p-10 text-center text-sm text-ink-500">
          没有匹配到的文章，换个关键词试试？
        </p>
      ) : (
        <div className={`reveal-group grid gap-5 sm:grid-cols-2 ${visible ? 'is-visible' : ''}`}>
          {list.map((article, i) => {
            const meta = categoryMeta[article.category]
            return (
              <Link
                key={article.slug}
                to={`/articles/${article.slug}`}
                style={{ ['--i' as string]: i }}
                className="reveal-item group flex flex-col gap-3 rounded-2xl border border-paper-200 bg-paper-50 p-6 transition-all hover:-translate-y-0.5 hover:border-coral-400/50 hover:shadow-md sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ${meta.badge}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    {meta.label}
                  </span>
                  <span className="text-xs text-ink-500">{article.readingMinutes} 分钟</span>
                </div>
                <h2 className="font-serif text-xl text-ink-900 transition-colors group-hover:text-coral-600 sm:text-2xl">
                  {article.title}
                </h2>
                <p className="text-sm leading-relaxed text-ink-500">{article.excerpt}</p>
                <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-500">
                  <time>{formatDate(article.date)}</time>
                  <div className="flex gap-2">
                    {article.tags.map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Articles
