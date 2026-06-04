import { Link, useParams } from 'react-router-dom'
import { articles, categoryMeta } from '../data/articles.ts'

const formatDate = (d: string) => {
  const date = new Date(d)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const article = articles.find((a) => a.slug === slug)

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
          <span
            key={tag}
            className="rounded-md border border-paper-200 px-2 py-1 text-xs text-ink-500"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  )
}

export default ArticleDetail
