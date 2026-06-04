import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal.ts'

const timeline = [
  {
    year: '2026',
    title: '把博客搬到这片林子里',
    desc: '从托管平台搬出来，用 React + Vite 自己搭一个安静的角落。',
  },
  {
    year: '2024 — 2025',
    title: '在产品和工程之间来回横跳',
    desc: '做了几个面向开发者的小工具，开始更认真地写东西、做设计。',
  },
  {
    year: '2022',
    title: '第一次写公开发表的技术文章',
    desc: '关于 React 渲染优化的小经验，意外被很多朋友收藏。',
  },
  {
    year: '2019',
    title: '走进前端这一行',
    desc: '从 jQuery 到 Vue 到 React，从切图仔到能独立交付一个产品。',
  },
]

const nowItems = [
  { label: '工作', value: '一家小公司的前端工程师' },
  { label: '正在学', value: 'Rust、设计排版' },
  { label: '正在读', value: '《纳瓦尔宝典》《长日将尽》' },
  { label: '正在玩', value: 'Pixel 摄影、长距离散步' },
]

const principles = [
  '认真做每一件值得做的事，哪怕只对一个人有用。',
  '把"慢"当作一种选择，而不是落后的代名词。',
  '不抢用户的时间，只在他需要时安静地在场。',
  '工具是延伸，不是替代。',
]

const About = () => {
  const [tlRef, tlVisible] = useReveal<HTMLOListElement>()
  const [nowRef, nowVisible] = useReveal<HTMLDivElement>()

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      {/* Hero */}
      <header className="mb-16 space-y-5">
        <p className="anim-fade-up text-xs font-medium tracking-[0.3em] text-coral-500 uppercase">
          about · 自我介绍
        </p>
        <h1
          className="anim-fade-up font-serif text-4xl leading-tight text-ink-900 sm:text-6xl"
          style={{ ['--delay' as string]: '120ms' }}
        >
          你好,
          <br />
          我是 wixi。
        </h1>
        <p
          className="anim-fade-up max-w-2xl text-base leading-loose text-ink-700 sm:text-lg"
          style={{ ['--delay' as string]: '260ms' }}
        >
          一个前端工程师, 业余写一点东西、拍一点照片。
          我喜欢"小而完整"的事物——干净的代码、留白的页面、走完一整圈的散步。
          这片林子是我用来安放那些不太适合发在社交媒体上的句子的地方。
        </p>
      </header>

      {/* Now */}
      <section className="mb-20">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-ink-900 sm:text-3xl">现在在做什么</h2>
          <span className="text-xs text-ink-500">/ now</span>
        </div>
        <div
          ref={nowRef}
          className={`reveal-group grid gap-4 sm:grid-cols-2 ${nowVisible ? 'is-visible' : ''}`}
        >
          {nowItems.map((item, i) => (
            <div
              key={item.label}
              style={{ ['--i' as string]: i }}
              className="reveal-item flex items-baseline gap-4 rounded-2xl border border-paper-200 bg-paper-50 p-5 sm:p-6"
            >
              <span className="shrink-0 text-xs font-medium tracking-[0.2em] text-coral-500 uppercase">
                {item.label}
              </span>
              <span className="text-sm text-ink-900 sm:text-base">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-20">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-ink-900 sm:text-3xl">一些小节点</h2>
          <span className="text-xs text-ink-500">/ timeline</span>
        </div>
        <ol
          ref={tlRef}
          className={`reveal-group relative space-y-8 border-l border-paper-200 pl-6 sm:pl-8 ${tlVisible ? 'is-visible' : ''}`}
        >
          {timeline.map((item, i) => (
            <li
              key={item.year}
              style={{ ['--i' as string]: i }}
              className="reveal-item relative"
            >
              <span
                aria-hidden
                className="absolute -left-[33px] top-2 flex h-3 w-3 items-center justify-center sm:-left-[41px]"
              >
                <span className="h-3 w-3 rounded-full bg-paper-50 ring-2 ring-coral-400" />
              </span>
              <div className="font-mono text-xs tracking-wider text-coral-500">{item.year}</div>
              <h3 className="mt-1 font-serif text-lg text-ink-900 sm:text-xl">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-500 sm:text-base">{item.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Principles */}
      <section className="mb-20">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl text-ink-900 sm:text-3xl">几件相信的事</h2>
          <span className="text-xs text-ink-500">/ principles</span>
        </div>
        <ul className="space-y-3">
          {principles.map((line, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl bg-paper-100/50 px-5 py-4 text-sm leading-relaxed text-ink-700 sm:text-base"
            >
              <span className="select-none text-coral-500">{String(i + 1).padStart(2, '0')}</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Contact */}
      <section className="rounded-2xl border border-paper-200 bg-gradient-to-br from-paper-100/60 to-coral-100/40 p-7 sm:p-10">
        <h2 className="font-serif text-2xl text-ink-900 sm:text-3xl">想聊聊?</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-700 sm:text-base">
          可以发邮件,也可以在 GitHub 或小红书上找我。无论是讨论代码、推荐书、
          还是单纯说一声"嗨",我都很乐意收到。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="mailto:3212722403@qq.com"
            className="inline-flex items-center gap-2 rounded-lg bg-coral-500 px-5 py-2.5 text-sm font-medium text-paper-50 transition-all hover:-translate-y-0.5 hover:bg-coral-600 hover:shadow-md"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 6-10 7L2 6" />
            </svg>
            发邮件
          </a>
          <a
            href="https://github.com/88wixi"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-900/10 bg-paper-50 px-5 py-2.5 text-sm font-medium text-ink-900 transition-all hover:-translate-y-0.5 hover:border-ink-900/30 hover:shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.35.77 1.05.77 2.11v3.13c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
            GitHub
          </a>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-900/10 bg-paper-50 px-5 py-2.5 text-sm font-medium text-ink-900 transition-all hover:-translate-y-0.5 hover:border-ink-900/30 hover:shadow-sm"
          >
            看看我的文章 →
          </Link>
        </div>
      </section>
    </div>
  )
}

export default About
