import { useCallback, useRef, useState } from 'react'

/**
 * 滚动入场：把返回的 ref 绑到元素上，元素进入视口后 visible 变 true。
 *
 * 用 callback ref 而非 useRef + useEffect：observer 在「节点真正挂载」时才绑定，
 * 不挑组件挂载的那一刻。这样条件渲染、异步数据到达后才出现的容器（如照片相册
 * 等 R2 清单加载完才渲染）也能正确触发进场——否则 effect 早跑完、ref 还是 null，
 * observer 永远绑不上，子项卡在 opacity:0 整片空白。
 *
 * threshold 默认 0：只要元素有「任意一像素」进入视口就触发。不能用 0.15 这类比例阈值——
 * intersectionRatio = 可见高度 / 元素总高度，相册很高时该比例首屏到不了 15%，于是
 * 首屏空白、必须往下滚才显示。rootMargin 底部 +120px 让它在快进入视口时提前播放。
 */
export const useReveal = <T extends HTMLElement = HTMLDivElement>(threshold = 0) => {
  const [visible, setVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (el: T | null) => {
      // 节点变化/卸载时先断开旧 observer
      observerRef.current?.disconnect()
      observerRef.current = null
      if (!el) return
      if (typeof IntersectionObserver === 'undefined') {
        setVisible(true)
        return
      }
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setVisible(true)
              observer.disconnect()
              observerRef.current = null
              break
            }
          }
        },
        { rootMargin: '0px 0px 120px 0px', threshold },
      )
      observer.observe(el)
      observerRef.current = observer
    },
    [threshold],
  )

  return [ref, visible] as const
}
