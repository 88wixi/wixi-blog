import { useEffect, useState } from 'react'
import LazyImage from '../components/LazyImage.tsx'
import { fetchMemos, memoImageSrc, type Memo } from '../data/memos.ts'
import { thumb } from '../data/photos.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { formatDate } from '../lib/date.ts'

const Memos = () => {
  usePageTitle('碎念')
  const [memos, setMemos] = useState<Memo[] | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    void fetchMemos().then((list) => {
      if (!alive) return
      setMemos(list)
      setReady(true)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <header className="mb-12 space-y-3">
        <p className="text-xs font-medium tracking-[0.3em] text-coral-500 uppercase">memos</p>
        <h1 className="font-serif text-4xl text-ink-900 sm:text-5xl">碎念</h1>
        <p className="max-w-xl text-sm text-ink-500">
          不成篇的句子、路上随手拍的一张图。比文章轻, 比沉默重一点。
        </p>
      </header>

      {!ready ? (
        // 骨架占位
        <div className="space-y-10 border-l border-paper-200 pl-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-24 animate-pulse rounded bg-paper-200/70" />
              <div className="h-4 w-full max-w-md animate-pulse rounded bg-paper-200/70" />
              <div className="h-4 w-2/3 max-w-sm animate-pulse rounded bg-paper-200/70" />
            </div>
          ))}
        </div>
      ) : !memos || memos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-paper-200 bg-paper-100/40 py-20 text-center text-sm text-ink-500">
          这里还很安静, 第一句话正在路上。
        </div>
      ) : (
        <ol className="relative space-y-12 border-l border-paper-200 pl-6 sm:pl-8">
          {memos.map((m, i) => (
            <li key={`${m.date}-${i}`} className="relative">
              {/* 时间线圆点 */}
              <span
                aria-hidden
                className="absolute top-1.5 -left-[calc(1.5rem+5px)] h-2.5 w-2.5 rounded-full border-2 border-paper-50 bg-coral-400 sm:-left-[calc(2rem+5px)]"
              />
              <time className="font-mono text-xs tracking-wide text-ink-500">
                {formatDate(m.date)}
              </time>
              <p className="mt-2 max-w-xl font-serif text-base leading-loose whitespace-pre-line text-ink-700 sm:text-lg">
                {m.text}
              </p>
              {m.image && (
                <div className="mt-4 max-w-md overflow-hidden rounded-xl border border-paper-200 bg-paper-100">
                  <LazyImage
                    src={thumb(memoImageSrc(m.image), 800)}
                    fallbackSrc={memoImageSrc(m.image)}
                    alt=""
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default Memos
