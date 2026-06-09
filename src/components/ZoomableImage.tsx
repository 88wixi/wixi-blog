import { useCallback, useEffect, useRef, useState } from 'react'

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
 */
const ZoomableImage = ({ src, alt }: { src: string; alt: string }) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const view = useRef({ scale: 1, tx: 0, ty: 0 })
  const pointers = useRef<Map<number, Pt>>(new Map())
  const pinch = useRef<{ d: number; m: Pt } | null>(null)
  const lastPan = useRef<Pt | null>(null)
  const lastTap = useRef(0)
  const [zoomed, setZoomed] = useState(false)

  const apply = useCallback(() => {
    const { scale, tx, ty } = view.current
    if (imgRef.current) {
      imgRef.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`
    }
  }, [])

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
    [apply, clamp],
  )

  const reset = useCallback(() => {
    view.current = { scale: 1, tx: 0, ty: 0 }
    apply()
    setZoomed(false)
  }, [apply])

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
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

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
      className="lightbox-pop flex max-h-[86vh] max-w-[94vw] touch-none items-center justify-center overflow-hidden"
    >
      <img
        ref={imgRef}
        key={src}
        src={src}
        alt={alt}
        draggable={false}
        className="max-h-[86vh] max-w-[94vw] origin-center select-none rounded-lg object-contain shadow-2xl will-change-transform"
        style={{ cursor: zoomed ? 'grab' : 'zoom-in' }}
      />
    </div>
  )
}

export default ZoomableImage
