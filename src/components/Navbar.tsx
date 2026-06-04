import { NavLink, Link } from 'react-router-dom'

const navItems = [
  { to: '/', label: '小记', end: true },
  { to: '/articles', label: '文章', end: false },
  { to: '/photos', label: '照片', end: false },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'nav-link text-sm transition-colors sm:text-base',
    isActive ? 'is-active text-ink-900' : 'text-ink-500 hover:text-ink-900',
  ].join(' ')

const IconButton = ({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    title={label}
    className="flex h-9 w-9 items-center justify-center rounded-lg border border-paper-200 bg-paper-50 text-ink-700 transition-all hover:-translate-y-0.5 hover:border-coral-400 hover:text-coral-500"
  >
    {children}
  </a>
)

const Navbar = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-paper-200/70 bg-paper-50/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-paper-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </span>
          <span className="font-serif text-lg font-medium text-ink-900 sm:text-xl">
            wixi 的林间小记
          </span>
        </Link>

        <nav className="flex items-center gap-5 sm:gap-7">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <div className="hidden items-center gap-2 sm:flex">
            <IconButton href="https://github.com/88wixi" label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.35.77 1.05.77 2.11v3.13c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
              </svg>
            </IconButton>
            <IconButton
              href="https://www.xiaohongshu.com/user/profile/5f48e164000000000101d83d"
              label="小红书"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </IconButton>
            <IconButton href="https://v.douyin.com/RCMh9jgQZqs/" label="抖音">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </IconButton>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
