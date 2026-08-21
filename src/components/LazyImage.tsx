import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { springLayout } from '../lib/motion.ts'

type Props = {
  src: string
  alt: string
  className?: string
  /** 与灯箱共享的元素 id：点开时这张图从格子里连续放大到全屏，关闭时飞回来 */
  layoutId?: string
  /**
   * 未加载时用来撑出高度的宽高比（宽/高）。瀑布流里若不占位，图片加载前高度为 0，
   * 会全部堆进首屏视口、被浏览器判定为「可见」而一次性加载，懒加载就失效了。
   */
  ratio?: number
  /** 缩略图加载失败时回退到这个地址（如 Cloudflare 变换未开启时退回原图），只回退一次。 */
  fallbackSrc?: string
}

/**
 * 懒加载图片：用 IntersectionObserver 监听，离视口还有一段距离时才挂载 <img> 发起请求，
 * 未加载时按宽高比占位撑高、加载完淡入；失败可回退原图。
 * 相比原生 loading="lazy"，在 masonry(columns) 布局下更可靠——不会一次性把整列图片塞进 DOM。
 */
const LazyImage = ({ src, alt, className, ratio = 0.78, fallbackSrc, layoutId }: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const triedFallback = useRef(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el || inView) return
    // 不支持 IO 的老浏览器直接加载
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px 0px' }, // 提前 400px 预加载，滚动时基本无缝
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView])

  return (
    <div
      ref={wrapRef}
      className="w-full overflow-hidden bg-paper-100"
      style={loaded ? undefined : { aspectRatio: String(ratio) }}
    >
      {inView && (
        <motion.img
          layoutId={layoutId}
          transition={springLayout}
          src={src}
          alt={alt}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            if (!fallbackSrc || triedFallback.current) return
            triedFallback.current = true
            e.currentTarget.src = fallbackSrc
          }}
          className={`block w-full transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${className ?? ''}`}
        />
      )}
    </div>
  )
}

export default LazyImage
