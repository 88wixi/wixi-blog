import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cities, type City } from '../data/photos.ts'

/** 高德地图（AutoNavi）中文路网瓦片 —— 中国 + 日本城市都显示中文 */
const TILE_URL =
  'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
const TILE_SUBDOMAINS = '1234'
const TILE_ATTRIBUTION = '© 高德地图 AutoNavi'

const makeIcon = (active: boolean) =>
  L.divIcon({
    className: 'travel-pin',
    html: `<span class="pin ${active ? 'is-active' : ''}"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })

const Travel = () => {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const [activeSlug, setActiveSlug] = useState<string>(cities[0]?.slug ?? '')

  const active = useMemo(
    () => cities.find((c) => c.slug === activeSlug) ?? cities[0],
    [activeSlug],
  )

  // 初始化地图（只跑一次）
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: false,
      doubleClickZoom: true,
      minZoom: 3,
      maxZoom: 16,
      // 用 Leaflet 内置滚轮缩放, 步长缩小到 1/4 级让它感觉准连续, 同时瓦片能正常加载
      zoomSnap: 0.25,
      zoomDelta: 0.25,
      wheelPxPerZoomLevel: 70,
      wheelDebounceTime: 40,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
    })
    mapInstanceRef.current = map
    map.zoomControl.setPosition('topright')

    L.tileLayer(TILE_URL, {
      maxZoom: 18,
      subdomains: TILE_SUBDOMAINS,
    }).addTo(map)

    L.control
      .attribution({ position: 'bottomleft', prefix: false })
      .addAttribution(TILE_ATTRIBUTION)
      .addTo(map)

    // 自动框住所有 pin
    const bounds = L.latLngBounds(cities.map((c) => c.coords))
    map.fitBounds(bounds, { padding: [50, 50] })

    cities.forEach((c) => {
      const marker = L.marker(c.coords, {
        icon: makeIcon(c.slug === cities[0]?.slug),
        title: c.name,
      }).addTo(map)
      marker.bindTooltip(c.name, {
        permanent: true,
        direction: 'top',
        offset: [0, -8],
        className: 'travel-tooltip',
      })
      marker.on('click', () => {
        setActiveSlug(c.slug)
        map.flyTo(c.coords, Math.max(map.getZoom(), 5), { duration: 0.8 })
      })
      markersRef.current[c.slug] = marker
    })

    // 监听容器尺寸变化（响应式断点切换）
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(mapRef.current)

    return () => {
      ro.disconnect()
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = {}
    }
  }, [])

  // 切换激活态时刷新 pin 样式
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([slug, marker]) => {
      marker.setIcon(makeIcon(slug === activeSlug))
    })
  }, [activeSlug])

  const flyToCity = (city: City) => {
    setActiveSlug(city.slug)
    mapInstanceRef.current?.flyTo(
      city.coords,
      Math.max(mapInstanceRef.current.getZoom(), 5),
      { duration: 0.8 },
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      {/* Header */}
      <header className="mb-10 space-y-4 sm:mb-12">
        <p className="anim-fade-up text-xs font-medium tracking-[0.3em] text-coral-500 uppercase">
          travel · 走过哪些地方
        </p>
        <h1
          className="anim-fade-up font-serif text-4xl leading-tight text-ink-900 sm:text-6xl"
          style={{ ['--delay' as string]: '120ms' }}
        >
          路上散落的城市
        </h1>
        <p
          className="anim-fade-up max-w-2xl text-base leading-loose text-ink-700 sm:text-lg"
          style={{ ['--delay' as string]: '260ms' }}
        >
          一份慢慢长起来的小地图。每个 pin 是一段日子, 点一下能看见我在那里拍的几张照。
        </p>
      </header>

      {/* 主区：左地图 + 右详情（严格等高） */}
      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        {/* 地图 */}
        <div className="lg:col-span-3">
          <div
            ref={mapRef}
            aria-label="旅行地图"
            className="h-[420px] w-full overflow-hidden rounded-3xl border border-paper-200 bg-paper-100 shadow-sm sm:h-[520px] lg:h-[600px]"
          />
          <p className="mt-3 text-xs text-ink-500">点 pin 切换城市 · 滚轮或角落 +/- 缩放 · 双指可缩放</p>
        </div>

        {/* 城市详情：固定高度匹配地图 */}
        <aside className="lg:col-span-2 lg:h-[600px]">
          <CityDetail city={active} />
        </aside>
      </div>

      {/* 城市快捷列表 */}
      <div className="mt-12">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-ink-900 sm:text-xl">
            一共去过 {cities.length} 个地方
          </h2>
          <span className="text-xs text-ink-500">/ 持续累加中</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {cities.map((c) => {
            const isActive = c.slug === activeSlug
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => flyToCity(c)}
                className={[
                  'group flex items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                  isActive
                    ? 'border-coral-400 bg-coral-100/30 shadow-sm'
                    : 'border-paper-200 bg-paper-50 hover:-translate-y-0.5 hover:border-coral-400/50 hover:shadow-sm',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-flex h-2 w-2 shrink-0 rounded-full transition-colors',
                    isActive ? 'bg-coral-500' : 'bg-ink-300 group-hover:bg-coral-400',
                  ].join(' ')}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-base text-ink-900">{c.name}</div>
                  <div className="font-mono text-[10px] tracking-wider text-ink-500 uppercase">
                    {c.region}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-ink-500">{c.photos.length} 张</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const CityDetail = ({ city }: { city: City | undefined }) => {
  if (!city) return null

  return (
    <article
      key={city.slug}
      className="anim-fade flex h-[420px] flex-col overflow-hidden rounded-3xl border border-paper-200 bg-paper-50 shadow-sm sm:h-[520px] lg:h-full"
    >
      {/* 顶部封面 (固定高度) */}
      <div className="relative h-44 shrink-0 overflow-hidden bg-paper-100 sm:h-52 lg:h-56">
        <img
          src={city.cover}
          alt={city.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper-50 via-paper-50/0 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-baseline gap-3">
          <h3 className="font-serif text-3xl text-ink-900 sm:text-4xl">{city.name}</h3>
          <span className="font-mono text-[10px] tracking-[0.2em] text-ink-500 uppercase">
            {city.region}
          </span>
        </div>
      </div>

      {/* 中段：描述 + 缩略图（可滚动） */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6 sm:p-7">
        <p className="font-serif text-base leading-relaxed text-ink-900 sm:text-lg">
          {city.description}
        </p>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-[10px] font-medium tracking-[0.25em] text-coral-500 uppercase">
              snapshots
            </span>
            <span className="text-xs text-ink-500">{city.photos.length} 张</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {city.photos.slice(0, 3).map((p) => (
              <Link
                key={p.id}
                to={`/photos/${city.slug}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-paper-100"
                title={p.caption}
              >
                <img
                  src={p.src}
                  alt={p.caption}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-ink-900/0 transition-colors group-hover:bg-ink-900/15" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 底栏 CTA (固定贴底) */}
      <Link
        to={`/photos/${city.slug}`}
        className="group flex items-center justify-between border-t border-paper-200 bg-paper-100/40 px-6 py-4 text-sm text-ink-700 transition-colors hover:bg-coral-100/30 hover:text-coral-600 sm:px-7"
      >
        <span>看 {city.name} 的全部照片</span>
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    </article>
  )
}

export default Travel
