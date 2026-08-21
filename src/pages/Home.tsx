import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import { articles, categoryMeta } from '../data/articles.ts'
import { thumb } from '../data/photos.ts'
import { formatDate } from '../lib/date.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import Hitokoto from '../components/Hitokoto.tsx'
import { springLayout, springTouch, staggerContainer, staggerItem } from '../lib/motion.ts'

const MotionLink = motion.create(Link)

// Hero 图放自己的 R2（img.wixi88.xyz，国内可访问）；此前用 images.unsplash.com，
// 大陆基本加载不出来。展示走 thumb() 缩略图变换，失败时 onError 回退原图。
const heroImages = [
  'https://img.wixi88.xyz/hero/forest-01.jpg',
  'https://img.wixi88.xyz/hero/forest-02.jpg',
  'https://img.wixi88.xyz/hero/forest-03.jpg',
  'https://img.wixi88.xyz/hero/forest-04.jpg',
]

const HERO_INTERVAL_MS = 7000

const statusItems = [
  { dot: 'text-coral-500', label: '正在读', value: '《明朝那些事》' },
  { dot: 'text-sage-500', label: '本周主题', value: '减少切换成本' },
  { dot: 'text-ink-700', label: '下一篇', value: '用 Tailwind 写内容型页面' },
]

const delay = (ms: number): CSSProperties => ({ ['--delay' as string]: `${ms}ms` })

// 全角开引号/书名号（《「『【（〈“）字形偏右、左侧留白，用负缩进让首字左对齐
const OPENING_PUNCT = /^[《「『【（〈“]/
const optical = (v: string): CSSProperties => (OPENING_PUNCT.test(v) ? { textIndent: '-0.42em' } : {})

const Home = () => {
  usePageTitle()
  const latest = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4)
  const [heroIndex, setHeroIndex] = useState(0)

  // Hero 视差：往下滚时背景图比页面走得慢一点，露出「图在文字后面更远处」的层次。
  // 图层容器做成 124% 高、上下各留 12% 余量，位移时才不会在顶部拉出空白。
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '10%'])
  // 只挂载「展示过的 + 下一张」：4 张大图全挂会在首屏一次性下载
  // （对视口内 opacity-0 的图，loading="lazy" 不生效）。展示过的保留以便淡出。
  const [heroMounted, setHeroMounted] = useState<Set<number>>(() => new Set([0]))

  useEffect(() => {
    setHeroMounted((prev) => {
      const next = (heroIndex + 1) % heroImages.length
      if (prev.has(heroIndex) && prev.has(next)) return prev
      return new Set(prev).add(heroIndex).add(next)
    })
  }, [heroIndex])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(
      () => setHeroIndex((i) => (i + 1) % heroImages.length),
      HERO_INTERVAL_MS,
    )
    return () => window.clearInterval(id)
  }, [])

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative h-[520px] w-full overflow-hidden sm:h-[560px]">
        <motion.div className="absolute inset-x-0 -top-[12%] h-[124%]" style={{ y: heroY }}>
          {heroImages.map((src, i) =>
            heroMounted.has(i) ? (
              <img
                key={src}
                src={thumb(src, 1600)}
                alt=""
                decoding="async"
                onError={(e) => {
                  if (e.currentTarget.src !== src) e.currentTarget.src = src
                }}
                className={[
                  'absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-out',
                  i === heroIndex ? 'opacity-100 anim-ken-burns' : 'opacity-0',
                ].join(' ')}
              />
            ) : null,
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-paper-50/95 via-paper-50/80 to-paper-50/40" />
        <div className="relative mx-auto flex h-full w-full max-w-6xl items-center px-5 sm:px-8">
          <div className="max-w-xl space-y-6">
            <p
              className="anim-fade-up text-xs font-medium tracking-[0.3em] text-coral-500 uppercase"
              style={delay(0)}
            >
              forest notes · since 2026
            </p>
            <h1
              className="anim-fade-up font-serif text-5xl leading-tight text-ink-900 sm:text-6xl"
              style={delay(120)}
            >
              开屏即见,
              <br />
              一片小林子。
            </h1>
            <p
              className="anim-fade-up max-w-md text-base leading-loose text-ink-700"
              style={delay(260)}
            >
              一个安静但有锋利边界的个人博客,用来存放技术札记、阅读记录,以及对生活系统的观察。
            </p>
            <div className="anim-fade-up flex flex-wrap gap-3 pt-2" style={delay(400)}>
              <MotionLink
                to="/articles"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                transition={springTouch}
                className="group inline-flex items-center gap-2 rounded-lg bg-coral-500 px-5 py-2.5 text-sm font-medium text-paper-50 shadow-sm transition-colors hover:bg-coral-600 hover:shadow-md"
              >
                开始阅读
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </MotionLink>
              <MotionLink
                to="/photos"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                transition={springTouch}
                className="inline-flex items-center gap-2 rounded-lg border border-ink-900/10 bg-paper-50 px-5 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:border-ink-900/30 hover:shadow-sm"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                看看照片
              </MotionLink>
            </div>
          </div>

          {/* 轮播指示器（右下角） */}
          <div className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5 sm:bottom-6 sm:right-8">
            {heroImages.map((_, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={() => setHeroIndex(i)}
                aria-label={`第 ${i + 1} 张`}
                // 当前页的指示条用 spring 伸展，比 CSS 的定时 transition 更有弹性
                animate={{ width: i === heroIndex ? 32 : 12 }}
                whileHover={{ scaleY: 1.6 }}
                transition={springLayout}
                className={[
                  'h-1.5 rounded-full',
                  i === heroIndex ? 'bg-ink-900/70' : 'bg-ink-900/25 hover:bg-ink-900/40',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 今日 · 报刊版面：左一言 + 右 NOW */}
      <section className="relative overflow-hidden border-y border-paper-200/70 bg-gradient-to-br from-paper-100/40 via-paper-50 to-paper-100/30 py-10 sm:py-14">
        {/* 装饰背景：左上 + 右下两个超大色块虚化 */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-coral-300/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-sage-300/15 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            {/* 左 3/5：一言 */}
            <div className="lg:col-span-3">
              <Hitokoto />
            </div>

            {/* 右 2/5：NOW */}
            <aside className="relative lg:col-span-2 lg:border-l lg:border-paper-200/80 lg:pl-12 xl:pl-14">
              <div className="mb-6 flex items-center gap-3 text-[11px] font-medium tracking-[0.32em] text-coral-500 uppercase">
                <span className="h-px w-8 bg-coral-400/60" />
                now · 现在
              </div>
              <ul className="space-y-5 sm:space-y-6">
                {statusItems.map((item, i) => (
                  <li
                    key={item.label}
                    className="anim-fade-up flex items-start gap-3.5"
                    style={delay(200 + i * 80)}
                  >
                    <span
                      className={`dot-pulse mt-1.5 inline-flex h-2 w-2 shrink-0 rounded-full ${item.dot}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium tracking-[0.25em] text-ink-500 uppercase">
                        {item.label}
                      </div>
                      <div
                        className="mt-1 font-serif text-base text-ink-900 sm:text-lg"
                        style={optical(item.value)}
                      >
                        {item.value}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-[0.3em] text-coral-500 uppercase">
              latest posts
            </p>
            <h2 className="font-serif text-4xl text-ink-900 sm:text-5xl">最近文章</h2>
          </div>
          <Link
            to="/articles"
            className="hidden shrink-0 text-sm text-ink-500 transition-colors hover:text-coral-500 sm:inline-flex"
          >
            全部文章 →
          </Link>
        </div>

        {/* 滚动入场：whileInView + staggerChildren，卡片依次浮起。
            once 让它只播一次，amount: 0.1 意味着露出一角就开始，长卡片不会卡在首屏空白。 */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid gap-5 sm:grid-cols-2"
        >
          {latest.map((article) => {
            const meta = categoryMeta[article.category]
            return (
              <MotionLink
                key={article.slug}
                to={`/articles/${article.slug}`}
                variants={staggerItem}
                whileHover={{ y: -5 }}
                transition={springTouch}
                className="group flex flex-col gap-3 rounded-2xl border border-paper-200 bg-paper-50 p-6 transition-colors hover:border-coral-400/50 hover:shadow-md sm:p-7"
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
                <h3 className="font-serif text-xl text-ink-900 transition-colors group-hover:text-coral-600 sm:text-2xl">
                  {article.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-500">{article.excerpt}</p>
                <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-500">
                  <time>{formatDate(article.date)}</time>
                  <span className="translate-x-[-4px] text-coral-500 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                    阅读 →
                  </span>
                </div>
              </MotionLink>
            )
          })}
        </motion.div>
      </section>
    </div>
  )
}

export default Home
