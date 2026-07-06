import { useEffect, useRef, useState } from 'react'

/** 计数接口（Cloudflare Worker + KV，见 worker-api/）。公开地址非密钥。 */
const LIKES_API: string = import.meta.env.VITE_LIKES_API || 'https://api.wixi88.xyz'

// 已赞过的文章 slug 存 localStorage，防止无限重复点（个人博客不必更严格）
const LS_KEY = 'wixi-liked'

const readLiked = (): string[] => {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []
  } catch {
    return []
  }
}

const writeLiked = (slugs: string[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(slugs))
  } catch {
    /* 隐私模式：忽略 */
  }
}

/**
 * 文章尾部的「喜欢」：进页面拉一次计数，点一下 +1 并弹个小动画。
 * 接口失败时整个组件安静地缩起来（个人博客的心意功能，不值得报错打扰阅读）。
 */
const LikeButton = ({ slug }: { slug: string }) => {
  const [count, setCount] = useState<number | null>(null)
  const [liked, setLiked] = useState(() => readLiked().includes(slug))
  const [popping, setPopping] = useState(false)
  const popTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    setLiked(readLiked().includes(slug))
    setCount(null)
    const controller = new AbortController()
    fetch(`${LIKES_API}/likes/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        const c = (data as { count?: unknown } | null)?.count
        if (typeof c === 'number') setCount(c)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [slug])

  useEffect(() => () => window.clearTimeout(popTimer.current), [])

  if (count === null) return null // 接口没通（或还没回来）：不占版面

  const like = () => {
    if (liked) return
    // 乐观更新，失败也不回滚——顶多这一次没记上
    setLiked(true)
    setCount((c) => (c ?? 0) + 1)
    setPopping(true)
    popTimer.current = window.setTimeout(() => setPopping(false), 500)
    writeLiked([...readLiked(), slug])
    void fetch(`${LIKES_API}/likes/${encodeURIComponent(slug)}`, { method: 'POST' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        const c = (data as { count?: unknown } | null)?.count
        if (typeof c === 'number') setCount(c)
      })
      .catch(() => {})
  }

  return (
    <div className="mt-14 flex justify-center">
      <button
        type="button"
        onClick={like}
        disabled={liked}
        aria-label={liked ? '已喜欢' : '喜欢这篇'}
        className={[
          'group inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm transition-all',
          liked
            ? 'border-coral-400/60 bg-coral-100/40 text-coral-600'
            : 'border-paper-200 bg-paper-50 text-ink-500 hover:-translate-y-0.5 hover:border-coral-400 hover:text-coral-600 hover:shadow-sm',
        ].join(' ')}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={popping ? 'like-pop' : 'transition-transform group-hover:scale-110'}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span>{liked ? '喜欢过了' : '喜欢这篇'}</span>
        {count > 0 && <span className="font-mono text-xs opacity-70">{count}</span>}
      </button>
    </div>
  )
}

export default LikeButton
