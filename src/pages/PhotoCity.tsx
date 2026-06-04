import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cities, type Photo } from '../data/photos.ts'
import { useReveal } from '../hooks/useReveal.ts'

const PhotoCity = () => {
  const { city: slug } = useParams<{ city: string }>()
  const city = cities.find((c) => c.slug === slug)
  const [active, setActive] = useState<Photo | null>(null)
  const [galleryRef, galleryVisible] = useReveal<HTMLDivElement>()

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

      <div
        ref={galleryRef}
        className={`reveal-group columns-1 gap-4 sm:columns-2 lg:columns-3 ${galleryVisible ? 'is-visible' : ''}`}
      >
        {city.photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActive(photo)}
            style={{ ['--i' as string]: i }}
            className="reveal-item mb-4 block w-full overflow-hidden rounded-xl border border-paper-200 bg-paper-50 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <img src={photo.src} alt={photo.caption} loading="lazy" className="w-full" />
            <div className="flex items-center justify-between px-3 py-2 text-xs">
              <span className="text-ink-700">{photo.caption}</span>
              {photo.date && <span className="text-ink-500">{photo.date}</span>}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-ink-900/85 p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="max-h-[90vh] max-w-5xl overflow-hidden rounded-xl bg-paper-50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={active.src}
              alt={active.caption}
              className="max-h-[80vh] w-full object-contain"
            />
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-ink-900">{active.caption}</span>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="text-xs text-ink-500 hover:text-coral-500"
              >
                关闭 ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PhotoCity
