import { Link } from 'react-router-dom'
import { cities } from '../data/photos.ts'
import { useReveal } from '../hooks/useReveal.ts'

const Photos = () => {
  const [gridRef, visible] = useReveal<HTMLDivElement>()

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <header className="mb-10 space-y-3">
        <p className="text-xs font-medium tracking-[0.3em] text-coral-500 uppercase">
          photo cities
        </p>
        <h1 className="font-serif text-4xl text-ink-900 sm:text-5xl">照片 · 按城市</h1>
        <p className="max-w-2xl text-sm text-ink-500">
          每座城市都有它自己的光和声音。点开一座城,看看那段时间里的天空。
        </p>
      </header>

      <div
        ref={gridRef}
        className={`reveal-group grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${visible ? 'is-visible' : ''}`}
      >
        {cities.map((city, i) => (
          <Link
            key={city.slug}
            to={`/photos/${city.slug}`}
            style={{ ['--i' as string]: i }}
            className="reveal-item group block overflow-hidden rounded-2xl border border-paper-200 bg-paper-50 transition-all hover:-translate-y-0.5 hover:border-coral-400/50 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              {city.cover ? (
                <img
                  src={city.cover}
                  alt={city.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-paper-100 text-ink-300">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="12" cy="12" r="3" />
                    <path d="M8 5l1.5-2h5L16 5" />
                  </svg>
                  <span className="text-xs">照片整理中</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
              <span className="absolute right-3 top-3 rounded-md bg-paper-50/90 px-2 py-1 text-[11px] font-medium text-ink-900 backdrop-blur">
                {city.photos.length} 张
              </span>
              <div className="absolute bottom-3 left-4 right-4 flex items-baseline justify-between text-paper-50">
                <span className="font-serif text-2xl">{city.name}</span>
                <span className="text-xs opacity-80">{city.region}</span>
              </div>
            </div>
            <div className="px-5 py-4 text-sm text-ink-500 transition-colors group-hover:text-ink-700">
              {city.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Photos
