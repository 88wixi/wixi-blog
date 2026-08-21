import { useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, useScroll, useSpring } from 'motion/react'
import LikeButton from '../components/LikeButton.tsx'
import { articles, categoryMeta } from '../data/articles.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { formatDate } from '../lib/date.ts'
import { springLayout, springScroll, springTouch } from '../lib/motion.ts'

const sortedArticles = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1))

/* ---------- 目录（TOC）：从正文提取 h2/h3，宽屏右侧悬浮 ---------- */

type TocItem = { id: string; text: string; level: 2 | 3 }

// 中文标题直接保留字符做锚点 id；空白转 -，去掉标点
const slugify = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')

// 提取前先去掉围栏代码块，避免代码注释里的 ## 混进目录
const extractToc = (md: string): TocItem[] => {
  const items: TocItem[] = []
  const clean = md.replace(/```[\s\S]*?```/g, '')
  for (const m of clean.matchAll(/^(#{2,3})\s+(.+?)\s*$/gm)) {
    items.push({ level: m[1].length as 2 | 3, text: m[2], id: slugify(m[2]) })
  }
  return items
}

/**
 * 在**渲染后**的正文 DOM 里找到 query 第一次出现的位置，包一层 <mark> 并返回它。
 *
 * 不能拿 Markdown 源码的字符偏移来定位：源码经 react-markdown 渲染后偏移全对不上，
 * 而且第 i 个命中很可能落在代码块或链接 URL 里。这里直接走 TextNode，
 * 并跳过 PRE / CODE / A —— 那些地方的命中对读者没意义。
 */
const markFirstHit = (root: HTMLElement, query: string): HTMLElement | null => {
  const needle = query.trim().toLowerCase()
  if (!needle) return null

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = (node as Text).parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (parent.closest('pre, code, a')) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? ''
    const at = text.toLowerCase().indexOf(needle)
    if (at === -1) continue

    const range = document.createRange()
    range.setStart(node, at)
    range.setEnd(node, at + needle.length)
    const mark = document.createElement('mark')
    mark.className = 'search-hit'
    try {
      // 命中跨越多个节点时 surroundContents 会抛 InvalidStateError——
      // 那就放弃高亮，只把人滚过去，别让整个功能挂掉
      range.surroundContents(mark)
    } catch {
      range.detach?.()
      return null
    }
    return mark
  }
  return null
}

// 取渲染节点的纯文本（标题里带行内代码/加粗时也能得到完整文字做 id）
const nodeText = (node: ReactNode): string => {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (typeof node === 'object' && 'props' in node)
    return nodeText((node as ReactElement<{ children?: ReactNode }>).props.children)
  return ''
}

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') ?? ''
  const bodyRef = useRef<HTMLDivElement>(null)

  // 阅读进度：scrollYProgress 是 MotionValue，直接喂给顶部进度条的 scaleX。
  // 好处是滚动不再逐帧 setState 重渲染整篇文章，动画走在合成层上；
  // 再套一层 spring 让进度追赶时有一点惯性，比线性 transition 顺。
  const { scrollYProgress } = useScroll()
  const progressScaleX = useSpring(scrollYProgress, springScroll)

  const article = useMemo(() => articles.find((a) => a.slug === slug), [slug])
  usePageTitle(article?.title ?? '文章')

  const toc = useMemo(() => (article ? extractToc(article.content) : []), [article])
  const [activeId, setActiveId] = useState('')

  // 滚动高亮：观察正文标题，最先进入视口上部的算当前小节
  useEffect(() => {
    if (toc.length < 2) return
    const headings = Array.from(document.querySelectorAll('article h2[id], article h3[id]'))
    if (headings.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )
    headings.forEach((h) => io.observe(h))
    return () => io.disconnect()
  }, [toc, slug])

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
    history.replaceState(null, '', `#${id}`)
  }

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
    // 带 ?q= 的搜索深链由下面那个 effect 负责定位，这里让开，别先把人弹到顶部
    if (searchQuery) return
    // 带锚点的深链（分享的小节链接）优先定位到对应标题；中文 id 在 URL 里会被转义
    const hashId = decodeURIComponent(window.location.hash.slice(1))
    const target = hashId ? document.getElementById(hashId) : null
    if (target) {
      target.scrollIntoView()
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [slug, searchQuery])

  // 从搜索结果点进来（?q=…）：在正文里找到命中的那一句，滚过去，
  // 用一道墨痕从左刷过，停一下再收成一条细下划线。
  useEffect(() => {
    if (!searchQuery || !article) return
    let cancelled = false
    let mark: HTMLElement | null = null

    const run = async () => {
      // 必须等中文字体 swap 完成再量位置——自托管字体换上去会让整篇正文高度变化，
      // 早一步滚过去会停在旧字体下的坐标上。再等两帧确保 markdown 已 commit。
      try {
        await document.fonts.ready
      } catch {
        /* 老浏览器没有 document.fonts：直接往下走 */
      }
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      if (cancelled || !bodyRef.current) return

      mark = markFirstHit(bodyRef.current, searchQuery)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const target = mark ?? bodyRef.current
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })

      if (!mark) return
      if (reduce) {
        mark.classList.add('is-underlined')
        return
      }
      // 墨痕刷过 → 停 1.2s → 收成下划线，全部由 CSS 过渡承接（见 index.css）
      requestAnimationFrame(() => mark?.classList.add('is-painted'))
      window.setTimeout(() => {
        if (!cancelled) mark?.classList.add('is-underlined')
      }, 1400)
    }
    void run()

    return () => {
      cancelled = true
      // 卸载/换文章时把手动插入的 <mark> 还原成纯文本，
      // 免得 React 之后再渲染这棵子树时对不上
      const parent = mark?.parentNode
      if (mark && parent) {
        parent.replaceChild(document.createTextNode(mark.textContent ?? ''), mark)
        parent.normalize()
      }
    }
  }, [searchQuery, article, slug])

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
        <motion.div
          className="h-full origin-left bg-coral-500"
          style={{ scaleX: progressScaleX }}
        />
      </div>

      <article className="relative mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
        {/* 目录：只在有 ≥2 个小节标题时出现；挂在正文右侧的空白区（xl 起） */}
        {toc.length >= 2 && (
          <nav aria-label="目录" className="absolute left-full top-0 hidden h-full xl:block">
            <div className="sticky top-28 ml-8 w-52 border-l border-paper-200 pl-4">
              <p className="mb-3 text-[10px] font-medium tracking-[0.25em] text-coral-500 uppercase">
                on this page
              </p>
              <ul className="space-y-1.5">
                {toc.map((item, i) => (
                  <li key={`${item.id}-${i}`} className="relative">
                    {/* 当前小节的珊瑚色游标：贴在目录左边框上，随阅读在小节间滑动 */}
                    {activeId === item.id && (
                      <motion.span
                        layoutId="toc-active"
                        className="absolute -left-[17px] top-0 h-full w-0.5 rounded-full bg-coral-500"
                        transition={springLayout}
                      />
                    )}
                    <motion.a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault()
                        scrollToHeading(item.id)
                      }}
                      whileHover={{ x: 3 }}
                      transition={springTouch}
                      className={[
                        item.level === 3 ? 'pl-3' : '',
                        'block truncate text-xs leading-relaxed transition-colors',
                        activeId === item.id
                          ? 'text-coral-600'
                          : 'text-ink-500 hover:text-ink-900',
                      ].join(' ')}
                    >
                      {item.text}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
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
        <div
          ref={bodyRef}
          className="space-y-6 font-serif text-base leading-loose text-ink-700 sm:text-lg"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p>{children}</p>,
              h2: ({ children }) => (
                <h2
                  id={slugify(nodeText(children))}
                  className="mt-12 mb-4 scroll-mt-24 font-serif text-2xl text-ink-900 sm:text-3xl"
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  id={slugify(nodeText(children))}
                  className="mt-10 mb-3 scroll-mt-24 font-serif text-xl text-ink-900 sm:text-2xl"
                >
                  {children}
                </h3>
              ),
              ul: ({ children }) => (
                <ul className="list-disc space-y-2 pl-6 marker:text-coral-400">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal space-y-2 pl-6 marker:text-coral-400">{children}</ol>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noreferrer' : undefined}
                  className="text-coral-600 underline decoration-coral-300 underline-offset-2 hover:decoration-coral-500"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-coral-300 pl-5 text-ink-500 italic">
                  {children}
                </blockquote>
              ),
              code: ({ className, children }) =>
                className ? (
                  <code className={className}>{children}</code>
                ) : (
                  <code className="rounded bg-paper-200 px-1.5 py-0.5 font-mono text-[0.85em] text-ink-700">
                    {children}
                  </code>
                ),
              pre: ({ children }) => (
                <pre className="overflow-x-auto rounded-xl border border-paper-200 bg-ink-900/95 p-4 font-mono text-sm leading-relaxed text-paper-50">
                  {children}
                </pre>
              ),
              img: ({ src, alt }) => (
                <figure className="my-8">
                  <img
                    src={typeof src === 'string' ? src : undefined}
                    alt={alt ?? ''}
                    loading="lazy"
                    className="w-full rounded-2xl border border-paper-200 object-cover shadow-sm"
                  />
                  {alt ? (
                    <figcaption className="mt-2 text-center text-xs text-ink-500">{alt}</figcaption>
                  ) : null}
                </figure>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        <LikeButton slug={article.slug} />

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
