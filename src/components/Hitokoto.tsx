import { useCallback, useEffect, useRef, useState } from 'react'

type HitokotoResponse = {
  hitokoto: string
  from?: string
  from_who?: string | null
  uuid: string
}

const ENDPOINT = 'https://v1.hitokoto.cn/?c=a&c=b&c=d&c=i&c=k&encode=json'
const ROTATE_MS = 8000

const fallback: HitokotoResponse = {
  uuid: 'local-fallback',
  hitokoto: '风穿过林子，把所有句子都吹得轻了一点。',
  from: '林间小记',
  from_who: null,
}

const formatAttribution = (q: HitokotoResponse | null) => {
  if (!q) return ''
  const who = q.from_who?.trim()
  const from = q.from?.trim()
  if (who && from) return `${who}《${from}》`
  if (from) return `《${from}》`
  if (who) return who
  return ''
}

type HitokotoProps = {
  className?: string
}

const Hitokoto = ({ className }: HitokotoProps) => {
  const [current, setCurrent] = useState<HitokotoResponse | null>(null)
  const [outgoing, setOutgoing] = useState<HitokotoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [paused, setPaused] = useState(false)
  const aborterRef = useRef<AbortController | null>(null)
  const outgoingTimerRef = useRef<number | undefined>(undefined)

  const fetchOne = useCallback(async () => {
    aborterRef.current?.abort()
    const controller = new AbortController()
    aborterRef.current = controller
    setLoading(true)
    try {
      const res = await fetch(ENDPOINT, { signal: controller.signal })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const next = (await res.json()) as HitokotoResponse
      setError(false)
      setCurrent((prev) => {
        if (prev) {
          setOutgoing(prev)
          if (outgoingTimerRef.current) window.clearTimeout(outgoingTimerRef.current)
          outgoingTimerRef.current = window.setTimeout(() => setOutgoing(null), 650)
        }
        return next
      })
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return
      setError(true)
      setCurrent((prev) => prev ?? fallback)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOne()
    return () => {
      aborterRef.current?.abort()
      if (outgoingTimerRef.current) window.clearTimeout(outgoingTimerRef.current)
    }
  }, [fetchOne])

  useEffect(() => {
    if (paused) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let id: number | undefined
    const start = () => {
      if (id) return
      id = window.setInterval(() => {
        if (!document.hidden) fetchOne()
      }, ROTATE_MS)
    }
    const stop = () => {
      if (id) {
        window.clearInterval(id)
        id = undefined
      }
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [paused, fetchOne])

  const attribution = formatAttribution(current)

  return (
    <div
      aria-label="一言 hitokoto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className={['relative', className].filter(Boolean).join(' ')}
    >
      {/* 巨型水印引号（装饰用） */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-3 -top-10 select-none font-serif text-[140px] leading-none text-coral-400/15 sm:-left-4 sm:-top-14 sm:text-[200px]"
      >
        “
      </span>

      <div className="relative">
        {/* 小标题 */}
        <div className="mb-5 flex items-center gap-3 text-[11px] font-medium tracking-[0.32em] text-coral-500 uppercase">
          <span className="h-px w-8 bg-coral-400/60" />
          today&apos;s whisper
        </div>

        {/* 引用（两层 crossfade） */}
        <div className="relative">
          <blockquote
            key={`in-${current?.uuid ?? 'empty'}`}
            className="anim-hitokoto-in font-serif text-xl leading-[1.55] text-ink-900 sm:text-[1.75rem]"
          >
            {current ? current.hitokoto : '正在从风里捞一句话……'}
          </blockquote>

          {outgoing && (
            <blockquote
              key={`out-${outgoing.uuid}`}
              aria-hidden
              className="anim-hitokoto-out pointer-events-none absolute inset-0 font-serif text-xl leading-[1.55] text-ink-900 sm:text-[1.75rem]"
            >
              {outgoing.hitokoto}
            </blockquote>
          )}
        </div>

        {/* 出处 + 换一句 */}
        <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-8">
          <cite
            key={`cite-${current?.uuid ?? 'empty'}`}
            className="anim-fade text-sm not-italic text-ink-500"
            style={{ ['--delay' as string]: '180ms' }}
          >
            {error ? '— 网络抽风, 来自林子里的备用句' : attribution ? `— ${attribution}` : '— 一言'}
          </cite>
          <span aria-hidden className="text-paper-300">·</span>
          <button
            type="button"
            onClick={fetchOne}
            disabled={loading}
            className="group inline-flex items-center gap-1.5 text-xs text-ink-500 transition-colors hover:text-coral-600 disabled:cursor-wait disabled:opacity-60"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? 'animate-spin' : 'transition-transform duration-500 group-hover:rotate-180'}
            >
              <path d="M21 12a9 9 0 1 1-3.5-7.1" />
              <path d="M21 4v5h-5" />
            </svg>
            换一句
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hitokoto
