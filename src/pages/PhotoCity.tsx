import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import ZoomableImage from '../components/ZoomableImage.tsx'
import { cities } from '../data/photos.ts'
import { useReveal } from '../hooks/useReveal.ts'

const PhotoCity = () => {
  const { city: slug } = useParams<{ city: string }>()
  const city = cities.find((c) => c.slug === slug)
  const photos = city?.photos ?? []
  const [index, setIndex] = useState<number | null>(null)
  const [galleryRef, galleryVisible] = useReveal<HTMLDivElement>()

  const close = useCallback(() => setIndex(null), [])
  const show = useCallback(
    (delta: number) =>
      setIndex((cur) => (cur === null ? cur : (cur + delta + photos.length) % photos.length)),
    [photos.length],
  )

  // Esc 关闭、← → 切换；打开时锁定背景滚动
  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') show(1)
      else if (e.key === 'ArrowLeft') show(-1)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [index, close, show])

  if (!city) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-24 text-center sm:px-8">
        <p className="font-serif text-2xl text-ink-900">没有找到这座城。</p>
        <Link to="/photos" className="text-sm text-coral-500 hover:underline">
          ← 回到城市列表
        </Link>
      </div>
    )
  }

  const active = index === null ? null : photos[index]

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <header className="mb-10 space-y-3">
        <Link to="/photos" className="text-xs text-ink-500 hover:text-coral-500">
          ← 所有城市
        </Link>
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif text-4xl text-ink-900 sm:text-5xl">{city.name}</h1>
          <span className="text-sm text-ink-500">{city.region}</span>
        </div>
        <p className="max-w-2xl text-sm text-ink-500">{city.description}</p>
      </header>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-paper-200 bg-paper-100/40 py-20 text-center text-ink-300">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="12" cy="12" r="3" />
            <path d="M8 5l1.5-2h5L16 5" />
          </svg>
          <p className="text-sm text-ink-500">这座城的照片还在整理中,很快补上。</p>
        </div>
      ) : (
        <div
          ref={galleryRef}
          className={`reveal-group columns-1 gap-4 sm:columns-2 lg:columns-3 ${galleryVisible ? 'is-visible' : ''}`}
        >
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setIndex(i)}
              style={{ ['--i' as string]: i }}
              className="reveal-item mb-4 block w-full overflow-hidden rounded-xl border border-paper-200 bg-paper-50 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <img src={photo.src} alt={photo.caption} loading="lazy" className="w-full" />
              <div className="flex items-center justify-between px-3 py-2 text-xs">
                <span className="text-ink-700">{photo.caption}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && createPortal(
        <div
          className="lightbox anim-fade fixed inset-0 z-[80] flex flex-col items-center justify-center bg-ink-900/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={active.caption}
        >
          {/* 关闭 */}
          <button
            type="button"
            onClick={close}
            aria-label="关闭"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-paper-50 transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* 上一张 / 下一张 */}
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); show(-1) }}
                aria-label="上一张"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-paper-50 transition-colors hover:bg-white/20 sm:left-6"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); show(1) }}
                aria-label="下一张"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-paper-50 transition-colors hover:bg-white/20 sm:right-6"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          {/* 图片本体：可捏合/滚轮/双击放大，拖动查看细节 */}
          <ZoomableImage key={active.id} src={active.src} alt={active.caption} />

          {/* 说明 + 计数 */}
          <div
            className="mt-4 flex flex-col items-center gap-1 text-sm text-paper-50/90"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span>{active.caption}</span>
              {photos.length > 1 && (
                <span className="text-xs text-paper-50/50">
                  {index! + 1} / {photos.length}
                </span>
              )}
            </div>
            <span className="text-[11px] text-paper-50/40">双击 / 滚轮 / 双指缩放,拖动查看细节</span>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

export default PhotoCity
