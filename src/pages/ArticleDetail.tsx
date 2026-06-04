import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { articles, categoryMeta } from '../data/articles.ts'

const formatDate = (d: string) => {
  const date = new Date(d)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

const sortedArticles = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1))

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const [progress, setProgress] = useState(0)

  const article = useMemo(() => articles.find((a) => a.slug === slug), [slug])

  const { prev, next, related } = useMemo(() => {
    if (!article) return { prev: undefined, next: undefined, related: [] as typeof articles }
    const idx = sortedArticles.findIndex((a) => a.slug === article.slug)
    return {
      prev: idx > 0 ? sortedArticles[idx - 1] : undefined,
      next: idx < sortedArticles.length - 1 ? sortedArticles[idx + 1] : undefined,
      related: sortedArticles
        .filter((a) => a.slug !== article.slug && a.category === article.category)
        .slice(0, 3),
    }
  }, [article])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [slug])

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-24 text-center sm:px-8">
        <p className="font-serif text-2xl text-ink-900">这一页好像被风吹走了。</p>
        <Link to="/articles" className="text-sm text-coral-500 hover:underline">
          ← 回到文章列表
        </Link>
      </div>
    )
  }

  const meta = categoryMeta[article.category]

  return (
    <>
      {/* 阅读进度条 */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-30 h-0.5 bg-paper-200/40"
      >
        <div
          className="h-full bg-coral-500 transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }}
        />
      </div>

      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        <Link to="/articles" className="text-xs text-ink-500 hover:text-coral-500">
          ← 所有文章
        </Link>
        <header className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className={`rounded-md px-2 py-1 font-medium ${meta.badge}`}>
              {meta.label}
            </span>
            <time className="text-ink-500">{formatDate(article.date)}</time>
            <span className="text-ink-500">·</span>
            <span className="text-ink-500">{article.readingMinutes} 分钟</span>
          </div>
          <h1 className="font-serif text-3xl leading-snug text-ink-900 sm:text-5xl">
            {article.title}
          </h1>
          <p className="text-base text-ink-500 sm:text-lg">{article.excerpt}</p>
        </header>
        <hr className="my-10 border-paper-200" />
        <div className="space-y-6 font-serif text-base leading-loose text-ink-700 sm:text-lg">
          {article.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link
              key={tag}
              to={`/articles?tag=${encodeURIComponent(tag)}`}
              className="rounded-md border border-paper-200 px-2 py-1 text-xs text-ink-500 transition-colors hover:border-coral-400 hover:text-coral-600"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* 上一篇 / 下一篇 */}
        {(prev || next) && (
          <nav className="mt-16 grid gap-4 border-t border-paper-200 pt-10 sm:grid-cols-2">
            {prev ? (
              <Link
                to={`/articles/${prev.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border border-paper-200 bg-paper-50 p-5 transition-all hover:-translate-y-0.5 hover:border-coral-400/50 hover:shadow-sm"
              >
                <span className="text-xs text-ink-500">← 较新一篇</span>
                <span className="font-serif text-base text-ink-900 transition-colors group-hover:text-coral-600 sm:text-lg">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden className="hidden sm:block" />
            )}
            {next ? (
              <Link
                to={`/articles/${next.slug}`}
                className="group flex flex-col items-end gap-2 rounded-2xl border border-paper-200 bg-paper-50 p-5 text-right transition-all hover:-translate-y-0.5 hover:border-coral-400/50 hover:shadow-sm"
              >
                <span className="text-xs text-ink-500">较早一篇 →</span>
                <span className="font-serif text-base text-ink-900 transition-colors group-hover:text-coral-600 sm:text-lg">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden className="hidden sm:block" />
            )}
          </nav>
        )}

        {/* 相关推荐 */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-serif text-xl text-ink-900 sm:text-2xl">
                顺着这条路再走走
              </h2>
              <span className="text-xs text-ink-500">/ same {meta.label}</span>
            </div>
            <div className="grid gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/articles/${r.slug}`}
                  className="group flex items-baseline gap-4 rounded-xl border border-paper-200 bg-paper-50 px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-coral-400/50 hover:shadow-sm"
                >
                  <time className="shrink-0 font-mono text-xs text-ink-500">
                    {formatDate(r.date)}
                  </time>
                  <span className="font-serif text-base text-ink-900 transition-colors group-hover:text-coral-600">
                    {r.title}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}

export default ArticleDetail
