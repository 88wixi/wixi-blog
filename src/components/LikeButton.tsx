import { useEffect, useState } from 'react'
import ReadStamp from './ReadStamp.tsx'

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
 * 文章尾部的心意计数：进页面拉一次，盖章时 +1。
 * 接口失败时整个组件安静地缩起来（个人博客的心意功能，不值得报错打扰阅读）。
 *
 * 这里只管数据（KV 计数、乐观更新、localStorage 去重）；表现层是 ReadStamp 那枚印章
 * ——原来的心形按钮 + 四颗飞心已经换掉了，飞心是全站最不「纸墨」的一件。
 * 注意印章**不支持擦掉**：Worker 只有自增没有自减，能擦就会和 KV 的计数对不上。
 */
const LikeButton = ({ slug }: { slug: string }) => {
  const [count, setCount] = useState<number | null>(null)
  const [liked, setLiked] = useState(() => readLiked().includes(slug))

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

  if (count === null) return null // 接口没通（或还没回来）：不占版面

  const like = () => {
    if (liked) return
    // 乐观更新，失败也不回滚——顶多这一次没记上
    setLiked(true)
    setCount((c) => (c ?? 0) + 1)
    writeLiked([...readLiked(), slug])
    void fetch(`${LIKES_API}/likes/${encodeURIComponent(slug)}`, { method: 'POST' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: unknown) => {
        const c = (data as { count?: unknown } | null)?.count
        if (typeof c === 'number') setCount(c)
      })
      .catch(() => {})
  }

  // key 上带 slug：换文章时把印章内部的蓄力/墨色状态一并重置
  return <ReadStamp key={slug} stamped={liked} count={count} onStamp={like} />
}

export default LikeButton
