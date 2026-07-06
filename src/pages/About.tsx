import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useReveal } from '../hooks/useReveal.ts'

const timeline = [
  {
    year: '2026',
    title: '来深圳，转身做 AI',
    desc: '离开义乌，加入深圳一家制造业公司做 AI 应用开发，开始认真学 AI agent。顺手把博客搬进了这片林子。',
  },
  {
    year: '2024',
    title: '毕业，正式成为一名工程师',
    desc: '七月毕业、从实习生转正，能独立用 React + Laravel 扛起一个外贸项目的前后端，慢慢长成半个全栈。',
  },
  {
    year: '2023',
    title: '在义乌开始第一份工作',
    desc: '到义乌一家外贸公司实习，把学校里的 Vue 换成 React 上手真实项目，也第一次接触 Laravel/PHP，摸到了后端的门。',
  },
  {
    year: '2022',
    title: '在学校遇见前端',
    desc: '从 Vue 入门，第一次觉得"把脑子里的页面亲手做出来"是件让人上头的事。',
  },
]

const nowItems = [
  { label: '工作', value: 'AI 应用开发工程师（深圳）' },
  { label: '正在学', value: 'AI agent 开发' },
  { label: '正在看', value: '哔哩哔哩 / YouTube 上随便逛逛' },
  { label: '正在玩', value: '王者荣耀；揣着 Nikon Z5 到处走走拍拍' },
]

const principles = [
  '认真做每一件值得做的事，哪怕只对一个人有用。',
  '把"慢"当作一种选择，而不是落后的代名词。',
  '不抢用户的时间，只在他需要时安静地在场。',
  '工具是延伸，不是替代。',
]

const About = () => {
  usePageTitle('关于')
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
          一个从前端一路走到 AI 应用的工程师, 业余写一点东西、拍一点照片。
          手里一台 Nikon Z5, 一颗唯卓仕 85 定焦、一颗原厂 24-50,
          背着它去过大阪, 也去过重庆、桂林、杭州这些散落各地的城市。
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
          <a
            href="https://www.xiaohongshu.com/user/profile/5f48e164000000000101d83d"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-900/10 bg-paper-50 px-5 py-2.5 text-sm font-medium text-ink-900 transition-all hover:-translate-y-0.5 hover:border-ink-900/30 hover:shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            小红书
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
