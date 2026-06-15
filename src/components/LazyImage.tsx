import { useRef, useState } from 'react'

type Props = {
  src: string
  alt: string
  className?: string
  /**
   * 未加载时用来撑出高度的宽高比（宽/高）。瀑布流里若不占位，图片加载前高度为 0，
   * 会全部堆进首屏视口、被浏览器判定为「可见」而一次性加载，懒加载就失效了。
   */
  ratio?: number
  /** 缩略图加载失败时回退到这个地址（如 Cloudflare 变换未开启时退回原图），只回退一次。 */
  fallbackSrc?: string
}

/** 懒加载图片：滚动到附近才请求，未加载时占位撑高，加载完淡入；失败可回退原图。 */
const LazyImage = ({ src, alt, className, ratio = 0.78, fallbackSrc }: Props) => {
  const [loaded, setLoaded] = useState(false)
  const triedFallback = useRef(false)

  return (
    <div
      className="w-full overflow-hidden bg-paper-100"
      style={loaded ? undefined : { aspectRatio: String(ratio) }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          if (!fallbackSrc || triedFallback.current) return
          triedFallback.current = true
          e.currentTarget.src = fallbackSrc
        }}
        className={`block w-full transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${className ?? ''}`}
      />
    </div>
  )
}

export default LazyImage
