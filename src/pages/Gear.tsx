import { useMemo, useState } from 'react'
import {
  categoryMeta,
  gear,
  GEAR_FALLBACK_COVER,
  type GearCategory,
} from '../data/gear.ts'
import { useReveal } from '../hooks/useReveal.ts'

type Filter = 'all' | GearCategory

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'body', label: '机身' },
  { value: 'lens', label: '镜头' },
  { value: 'accessory', label: '配件' },
]

const Gear = () => {
  const [filter, setFilter] = useState<Filter>('all')
  const [listRef, listVisible] = useReveal<HTMLDivElement>()

  const list = useMemo(
    () => (filter === 'all' ? gear : gear.filter((g) => g.category === filter)),
    [filter],
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      {/* Header */}
      <header className="mb-12 space-y-4 sm:mb-16">
        <p className="anim-fade-up text-xs font-medium tracking-[0.3em] text-coral-500 uppercase">
          gear · 出门要带什么
        </p>
        <h1
          className="anim-fade-up font-serif text-4xl leading-tight text-ink-900 sm:text-6xl"
          style={{ ['--delay' as string]: '120ms' }}
        >
          我的小装备们
        </h1>
        <p
          className="anim-fade-up max-w-2xl text-base leading-loose text-ink-700 sm:text-lg"
          style={{ ['--delay' as string]: '260ms' }}
        >
          没什么很贵或很专业的器材, 就是一些能让我开心走出门、把眼前光景记下来的小东西。
          列在这儿, 一是给我自己一个清单, 二是有人问"你用什么拍的"时可以直接发过来。
        </p>
      </header>

      {/* Filters */}
      <div className="mb-10 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.value
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={[
                'rounded-lg px-4 py-2 text-sm transition-colors',
                active
                  ? 'bg-ink-900 text-paper-50'
                  : 'border border-paper-200 bg-paper-50 text-ink-700 hover:border-ink-300',
              ].join(' ')}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Gear list */}
      <div
        ref={listRef}
        className={`reveal-group space-y-8 sm:space-y-12 ${listVisible ? 'is-visible' : ''}`}
      >
        {list.map((item, i) => {
          const meta = categoryMeta[item.category]
          const isReversed = i % 2 === 1
          return (
            <article
              key={item.id}
              style={{ ['--i' as string]: i }}
              className="reveal-item grid items-stretch gap-0 overflow-hidden rounded-3xl border border-paper-200 bg-paper-50 shadow-sm transition-shadow hover:shadow-md lg:grid-cols-2"
            >
              {/* 图 */}
              <div
                className={[
                  'relative aspect-[4/3] overflow-hidden bg-paper-100 lg:aspect-auto',
                  isReversed ? 'lg:order-2' : 'lg:order-1',
                ].join(' ')}
              >
                <img
                  src={item.cover}
                  alt={`${item.brand} ${item.name}`}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget
                    if (img.src !== GEAR_FALLBACK_COVER) img.src = GEAR_FALLBACK_COVER
                  }}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-paper-50/85 px-3 py-1 text-[11px] font-medium backdrop-blur">
                  <span className={`inline-flex h-1.5 w-1.5 rounded-full bg-current ${meta.tint}`} />
                  <span className={meta.tint}>{meta.label}</span>
                  {item.acquiredAt && (
                    <>
                      <span className="text-paper-300">·</span>
                      <span className="font-mono text-ink-500">{item.acquiredAt}</span>
                    </>
                  )}
                </div>
              </div>

              {/* 文 */}
              <div
                className={[
                  'flex flex-col gap-5 p-7 sm:p-9',
                  isReversed ? 'lg:order-1' : 'lg:order-2',
                ].join(' ')}
              >
                <header className="space-y-1.5">
                  <p className="text-[11px] font-medium tracking-[0.25em] text-ink-500 uppercase">
                    {item.brand}
                  </p>
                  <h2 className="font-serif text-2xl text-ink-900 sm:text-3xl">{item.name}</h2>
                  {item.alias && (
                    <p className="font-serif text-sm italic text-coral-500">{item.alias}</p>
                  )}
                </header>

                <p className="font-serif text-base leading-relaxed text-ink-900 sm:text-lg">
                  {item.blurb}
                </p>

                <p className="text-sm leading-relaxed text-ink-500 sm:text-base">{item.story}</p>

                {/* Spec */}
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-paper-200 pt-5 sm:grid-cols-4">
                  {item.spec.map((s) => (
                    <div key={s.label} className="space-y-1">
                      <dt className="text-[10px] font-medium tracking-[0.2em] text-ink-500 uppercase">
                        {s.label}
                      </dt>
                      <dd className="font-mono text-sm text-ink-900">{s.value}</dd>
                    </div>
                  ))}
                </dl>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-paper-200 px-2 py-0.5 text-[11px] text-ink-500"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="mt-16 text-center text-xs text-ink-500">
        清单会不定期更新 · 有推荐的小镜头可以发我看看
      </p>
    </div>
  )
}

export default Gear
