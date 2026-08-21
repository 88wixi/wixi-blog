import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import LazyImage from '../components/LazyImage.tsx'
import ZoomableImage from '../components/ZoomableImage.tsx'
import { thumb } from '../data/photos.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { usePhotoCities } from '../hooks/usePhotoCities.ts'
import { useReveal } from '../hooks/useReveal.ts'

/** 下滑关闭的判定阈值：位移够远、或甩得够快 */
const DISMISS_OFFSET = 140
const DISMISS_VELOCITY = 700

const PhotoCity = () => {
  const { city: slug } = useParams<{ city: string }>()
  const { cities, ready } = usePhotoCities()
  const city = cities.find((c) => c.slug === slug)
  usePageTitle(city ? `${city.name} · 照片` : '照片')
  const photos = city?.photos ?? []
  const [index, setIndex] = useState<number | null>(null)
  const [galleryRef, galleryVisible] = useReveal<HTMLDivElement>()

  // 下滑关闭：y 走 MotionValue，遮罩透明度与舞台缩放由它派生——
  // 不经过 state，拖动全程不重渲染这一整页。
  const dragY = useMotionValue(0)
  const overlayOpacity = useTransform(dragY, [-DISMISS_OFFSET * 2, 0, DISMISS_OFFSET * 2], [0, 1, 0])
  const stageScale = useTransform(dragY, [-DISMISS_OFFSET * 2, 0, DISMISS_OFFSET * 2], [0.86, 1, 0.86])
  // 图被放大后手势要还给 ZoomableImage 平移。
  // ref 供 onDragEnd 同步读（state 会慢一帧，捏合回落的那帧会误判成甩关），
  // state 供 dragListener 这种需要触发重渲染的 prop 用。
  const zoomScaleRef = useRef(1)
  const [zoomed, setZoomed] = useState(false)
  // 触屏双击放大是两次快速 pointerdown，第二下手指稍微下滑就可能被判成「甩关」。
  // 每次按下后 300ms 内不做关闭判定。
  const lastPointerDownRef = useRef(0)

  const close = useCallback(() => setIndex(null), [])
  const show = useCallback(
    (delta: number) =>
      setIndex((cur) => (cur === null ? cur : (cur + delta + photos.length) % photos.length)),
    [photos.length],
  )

  // 清单后台更新导致照片数变少时收回越界的 index：否则 active 为 undefined，
  // 灯箱不渲染但下面的 effect 仍锁着 body 滚动，页面就卡住了
  useEffect(() => {
    if (index !== null && index >= photos.length) setIndex(photos.length ? photos.length - 1 : null)
  }, [index, photos.length])

  // Esc 关闭、← → 切换
  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') show(1)
      else if (e.key === 'ArrowLeft') show(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, close, show])

  // 背景滚动锁：上锁跟着「打开」走，解锁必须等退场动画结束（见 onExitComplete），
  // 否则图片飞回格子的那 0.4 秒里背景是能滚的，飞行落点就跟着跑了。
  useEffect(() => {
    if (index === null) return
    document.body.style.overflow = 'hidden'
  }, [index])

  // 组件卸载（比如直接切路由）时兜底解锁，避免把整页滚动永久锁死
  useEffect(() => () => {
    document.body.style.overflow = ''
  }, [])

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
        <Link
          to="/photos"
          className="relative z-10 -ml-2 inline-flex w-fit items-center gap-1 rounded-md px-2 py-1.5 text-sm text-ink-500 transition-colors hover:text-coral-500"
        >
          <span aria-hidden>←</span> 所有城市
        </Link>
        <div className="flex items-baseline gap-3">
          <h1 className="font-serif text-4xl text-ink-900 sm:text-5xl">{city.name}</h1>
          <span className="text-sm text-ink-500">{city.region}</span>
        </div>
        <p className="max-w-2xl text-sm text-ink-500">{city.description}</p>
      </header>

      {photos.length === 0 && !ready ? (
        // 清单还没回来：骨架占位，避免「整理中」一闪再跳出照片
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mb-4 animate-pulse rounded-xl bg-paper-200/70"
              style={{ height: `${180 + (i % 3) * 60}px` }}
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
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
              <LazyImage
                src={thumb(photo.src, 800)}
                fallbackSrc={photo.src}
                alt={photo.caption}
                // 与灯箱里那张共享：点开时从这一格连续放大过去，关闭时飞回来。
                // 用的是同一份 thumb(src,800) 缓存位图，零额外请求。
                // 两端必须**同时**挂着同一个 layoutId，Motion 才有一对盒子可量。
                layoutId={`photo-${photo.id}`}
              />
              <div className="flex items-center justify-between px-3 py-2 text-xs">
                <span className="text-ink-700">{photo.caption}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* AnimatePresence 必须在 portal **内部**：createPortal 返回的是 REACT_PORTAL_TYPE，
          isValidElement 为 false，AnimatePresence 根本追踪不到它，退场动画会被整个跳过。
          所以 portal 常驻挂在 body 上，由里面的 AnimatePresence 管进出。 */}
      {createPortal(
        <AnimatePresence
          // 退场结束才解锁背景滚动，并把拖拽位移复位，避免下次点开时舞台还偏着
          onExitComplete={() => {
            document.body.style.overflow = ''
            dragY.set(0)
          }}
        >
          {active && (
            <motion.div
              key="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-4 sm:p-8"
              onClick={close}
              role="dialog"
              aria-modal="true"
              aria-label={active.caption}
            >
              {/* 墨色遮罩单独一层：下滑时它的透明度跟着手指走，图却不跟着变淡 */}
              <motion.div
                aria-hidden
                className="absolute inset-0 -z-10 bg-ink-900/90"
                style={{ opacity: overlayOpacity }}
              />
              {/* 关闭：键盘用户和不懂手势的人唯一的出口，下滑关闭只是补充，不能替代它 */}
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

              {/* 图片本体：可捏合/滚轮/双击放大，拖动查看细节。
                  placeholder 用列表里已缓存的缩略图，点开即时垫底，原图加载完淡入。
                  外面这层负责「往下一带就把图放回格子里」。 */}
              <motion.div
                drag="y"
                dragDirectionLock
                dragElastic={0.25}
                dragSnapToOrigin
                // 图放大后单指要用来平移原图，这时把手势整个还给 ZoomableImage
                dragListener={!zoomed}
                style={{ y: dragY, scale: stageScale }}
                onPointerDownCapture={() => {
                  lastPointerDownRef.current = performance.now()
                }}
                onDragEnd={(_, info) => {
                  if (zoomScaleRef.current > 1) return
                  // 双击放大的第二下常常带一点下滑，300ms 内不判关闭
                  if (performance.now() - lastPointerDownRef.current < 300) return
                  if (
                    Math.abs(info.offset.y) > DISMISS_OFFSET ||
                    Math.abs(info.velocity.y) > DISMISS_VELOCITY
                  ) {
                    close()
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ZoomableImage
                  key={active.id}
                  src={active.src}
                  placeholder={thumb(active.src, 800)}
                  alt={active.caption}
                  layoutId={`photo-${active.id}`}
                  scaleRef={zoomScaleRef}
                  onZoomChange={setZoomed}
                />
              </motion.div>

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
                <span className="text-[11px] text-paper-50/40">
                  双击 / 滚轮 / 双指缩放,拖动查看细节；向下一带放回原处
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}

export default PhotoCity
