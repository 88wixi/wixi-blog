import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { motion } from 'motion/react'
import { springLayout } from '../lib/motion.ts'

type Pt = { x: number; y: number }

const MIN_SCALE = 1
const MAX_SCALE = 5

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)
const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

/**
 * 灯箱里的可缩放图片：
 * - 触屏：双指捏合缩放、单指拖动、双击放大/还原
 * - 桌面：滚轮缩放、拖动、双击放大/还原
 * 以指针/光标位置为中心缩放，缩放后限制在图片范围内拖动。
 * 传入 placeholder（列表里已缓存的缩略图）时，点开即时显示模糊小图垫底，
 * 原图在上面加载完再淡入，期间显示转圈——避免「点了一片黑等半天」。
 */
const ZoomableImage = ({
  src,
  alt,
  placeholder,
  layoutId,
  scaleRef,
  onZoomChange,
}: {
  src: string
  alt: string
  placeholder?: string
  /** 与网格缩略图共享，用于「从格子里长出来 / 飞回格子」 */
  layoutId?: string
  /** 缩放态变化时通知父级（父级据此决定要不要接管下滑关闭手势） */
  onZoomChange?: (zoomed: boolean) => void
  /**
   * 把当前缩放同步写回给父级。父级的下滑关闭要在 pointerdown 那一刻就知道
   * 图有没有被放大——用 state 会慢一帧（捏合回落到 1.02 的那帧就会把灯箱甩关）。
   */
  scaleRef?: RefObject<number>
}) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const view = useRef({ scale: 1, tx: 0, ty: 0 })
  const pointers = useRef<Map<number, Pt>>(new Map())
  const pinch = useRef<{ d: number; m: Pt } | null>(null)
  const lastPan = useRef<Pt | null>(null)
  const lastTap = useRef(0)
  const [zoomed, setZoomedState] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const setZoomed = useCallback(
    (next: boolean) => {
      setZoomedState(next)
      onZoomChange?.(next)
    },
    [onZoomChange],
  )

  // 切换图片时重置加载态
  useEffect(() => {
    setLoaded(false)
  }, [src])

  const apply = useCallback(() => {
    const { scale, tx, ty } = view.current
    if (scaleRef) scaleRef.current = scale
    if (imgRef.current) {
      imgRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`
    }
  }, [scaleRef])

  const center = (): Pt => {
    const r = wrapRef.current!.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }

  const clamp = useCallback(() => {
    const img = imgRef.current
    const wrap = wrapRef.current
    if (!img || !wrap) return
    const s = view.current.scale
    const maxX = Math.max(0, (img.offsetWidth * s - wrap.clientWidth) / 2)
    const maxY = Math.max(0, (img.offsetHeight * s - wrap.clientHeight) / 2)
    view.current.tx = Math.max(-maxX, Math.min(maxX, view.current.tx))
    view.current.ty = Math.max(-maxY, Math.min(maxY, view.current.ty))
  }, [])

  // 以屏幕点 p 为中心缩放到 nextScale
  const zoomAround = useCallback(
    (p: Pt, nextScale: number) => {
      const s = view.current.scale
      const ns = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale))
      if (ns === s) return
      const c = center()
      const dx = p.x - c.x
      const dy = p.y - c.y
      const k = ns / s
      view.current.tx = dx * (1 - k) + k * view.current.tx
      view.current.ty = dy * (1 - k) + k * view.current.ty
      view.current.scale = ns
      if (ns === MIN_SCALE) {
        view.current.tx = 0
        view.current.ty = 0
      }
      clamp()
      apply()
      setZoomed(ns > MIN_SCALE)
    },
    [apply, clamp, setZoomed],
  )

  const reset = useCallback(() => {
    view.current = { scale: 1, tx: 0, ty: 0 }
    apply()
    setZoomed(false)
  }, [apply, setZoomed])

  // 切换图片时复位
  useEffect(() => {
    reset()
  }, [src, reset])

  // 滚轮缩放（非被动监听以便 preventDefault）
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18
      zoomAround({ x: e.clientX, y: e.clientY }, view.current.scale * factor)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAround])

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    // 只在「双指捏合」或「已放大要平移」时独占指针。未放大的单指必须放走，
    // 让它冒泡到外层的下滑关闭手势——无条件 setPointerCapture 会把 pointermove
    // 全部锁在这里，外层 drag 永远收不到事件。
    if (pointers.current.size === 2 || view.current.scale > MIN_SCALE) {
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
    }

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { d: dist(a, b), m: mid(a, b) }
      lastPan.current = null
      return
    }

    lastPan.current = { x: e.clientX, y: e.clientY }
    // 触屏双击检测（鼠标走 onDoubleClick）
    if (e.pointerType !== 'mouse') {
      const now = e.timeStamp
      if (now - lastTap.current < 300) {
        zoomAround({ x: e.clientX, y: e.clientY }, view.current.scale > 1 ? 1 : 2.5)
        lastTap.current = 0
      } else {
        lastTap.current = now
      }
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]

    if (pts.length === 2 && pinch.current) {
      const nd = dist(pts[0], pts[1])
      const nm = mid(pts[0], pts[1])
      zoomAround(nm, view.current.scale * (nd / pinch.current.d))
      // 双指整体平移
      view.current.tx += nm.x - pinch.current.m.x
      view.current.ty += nm.y - pinch.current.m.y
      clamp()
      apply()
      pinch.current = { d: nd, m: nm }
    } else if (pts.length === 1 && view.current.scale > 1 && lastPan.current) {
      view.current.tx += e.clientX - lastPan.current.x
      view.current.ty += e.clientY - lastPan.current.y
      lastPan.current = { x: e.clientX, y: e.clientY }
      clamp()
      apply()
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (pointers.current.size === 1) {
      const p = [...pointers.current.values()][0]
      lastPan.current = { x: p.x, y: p.y }
    } else if (pointers.current.size === 0) {
      lastPan.current = null
    }
  }

  return (
    <div
      ref={wrapRef}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(e) =>
        zoomAround({ x: e.clientX, y: e.clientY }, view.current.scale > 1 ? 1 : 2.5)
      }
      className="relative flex max-h-[86vh] max-w-[94vw] touch-none items-center justify-center overflow-hidden"
    >
      {/* 缩略图垫底：点开即时显示（已缓存）。它同时承担两件事——
          1) 定下整个舞台的尺寸（原图未加载时也不会塌成 0）；
          2) 它才是带 layoutId 的共享元素，从网格那一格飞来、关闭时飞回去。
          所以它**必须常驻**，不能像以前那样 loaded 后卸载，否则退场没有东西可飞。 */}
      {placeholder ? (
        <motion.img
          layoutId={layoutId}
          transition={springLayout}
          src={placeholder}
          alt=""
          aria-hidden
          draggable={false}
          className={`max-h-[86vh] max-w-[94vw] select-none rounded-lg object-contain shadow-2xl ${
            loaded ? '' : 'blur-[1px]'
          }`}
        />
      ) : null}

      {/* 加载中转圈 */}
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-paper-50/30 border-t-paper-50" />
        </div>
      )}

      {/* 原图：绝对覆盖在缩略图之上，加载完淡入。退场时这一层先淡掉（0.12s），
          露出底下那张缩略图去飞回格子。外面包 motion.div 只管透明度，
          里面的 <img> 保持普通元素——它的 transform 由缩放手势命令式接管，
          交给 Motion 托管会和 Motion 自己的 transform 渲染打架。 */}
      <motion.div
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        className={
          placeholder
            ? 'absolute inset-0 flex items-center justify-center'
            : 'flex items-center justify-center'
        }
      >
        <img
          ref={imgRef}
          key={src}
          src={src}
          alt={alt}
          draggable={false}
          onLoad={() => setLoaded(true)}
          className={`max-h-[86vh] max-w-[94vw] origin-center select-none rounded-lg object-contain shadow-2xl transition-opacity duration-500 will-change-transform ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ cursor: zoomed ? 'grab' : 'zoom-in' }}
        />
      </motion.div>
    </div>
  )
}

export default ZoomableImage
