import { Link } from 'react-router-dom'
import { articles } from '../data/articles.ts'

const socials = [
  { href: 'https://github.com/88wixi', label: 'GitHub' },
  { href: 'https://www.xiaohongshu.com/user/profile/5f48e164000000000101d83d', label: '小红书' },
  { href: 'mailto:3212722403@qq.com', label: 'Email' },
]

const Footer = () => {
  const year = new Date().getFullYear()
  const recent = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3)

  return (
    <footer className="mt-20 border-t border-paper-200/70 bg-paper-100/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:grid-cols-3 sm:px-8 sm:py-14">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-paper-50">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            <span className="font-serif text-base font-medium text-ink-900">
              wixi 的林间小记
            </span>
          </Link>
          <p className="max-w-xs text-xs leading-relaxed text-ink-500">
            一个安静、慢一点的角落, 用来存放那些没地方放的句子。
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium tracking-[0.25em] text-coral-500 uppercase">
            recent
          </h3>
          <ul className="space-y-2">
            {recent.map((a) => (
              <li key={a.slug}>
                <Link
                  to={`/articles/${a.slug}`}
                  className="line-clamp-1 text-sm text-ink-700 transition-colors hover:text-coral-600"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-medium tracking-[0.25em] text-coral-500 uppercase">
            elsewhere
          </h3>
          <ul className="space-y-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-ink-700 transition-colors hover:text-coral-600"
                >
                  {s.label}
                  <span aria-hidden className="text-[10px] opacity-60">↗</span>
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-sm text-ink-700 transition-colors hover:text-coral-600"
              >
                关于这片林子
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper-200/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 text-xs text-ink-500 sm:px-8">
          <span className="font-serif">© {year} wixi · 林间小记</span>
          <span className="hidden font-mono text-[11px] tracking-wide opacity-70 sm:inline">
            made with care, in a slow afternoon
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
