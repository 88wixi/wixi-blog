import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

type Theme = 'light' | 'dark'
type Origin = { x: number; y: number }

const STORAGE_KEY = 'wixi-theme'

const getInitialTheme = (): Theme =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light'

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* 隐私模式下忽略写入失败 */
  }
}

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * 主题状态。切换时用 View Transitions API 做圆形揭示——圆心就是开关控件本身的位置
 * （由调用方传入），半径覆盖到最远的屏幕角。
 * 关灯：旧的明亮层从满屏收敛进开关；开灯：新的明亮层从开关发散铺满整页。
 * 不支持的浏览器退回到 .theme-transition 的全局色彩渐变。
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const switching = useRef(false)

  const toggle = useCallback(
    async (origin?: Origin) => {
      // 连续点击不能打断正在播放的快照，否则旧层会突然消失。
      if (switching.current) return
      switching.current = true
      const root = document.documentElement
      const next: Theme = root.classList.contains('dark') ? 'light' : 'dark'

      const commit = () => {
        flushSync(() => {
          applyTheme(next)
          setTheme(next)
        })
      }

      if (prefersReducedMotion()) {
        commit()
        switching.current = false
        return
      }

      // 不支持 View Transitions：退回整页色彩渐变。
      if (!document.startViewTransition || !origin) {
        root.classList.add('theme-transition')
        commit()
        await new Promise<void>((resolve) => window.setTimeout(resolve, 700))
        root.classList.remove('theme-transition')
        switching.current = false
        return
      }

      // 圆形揭示期间禁用元素自身的 CSS 过渡，确保新层从第一帧就是最终配色。
      root.classList.add('theme-reveal')
      let transition: ViewTransition | undefined
      try {
        transition = document.startViewTransition(commit)
        await transition.ready

        const { x, y } = origin
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y),
        )
        const atPoint = `circle(0px at ${x}px ${y}px)`
        const atFull = `circle(${endRadius}px at ${x}px ${y}px)`
        const goingDark = next === 'dark'

        root.animate(
          {
            // 关灯收拢旧明亮层；开灯展开新明亮层。
            clipPath: goingDark ? [atFull, atPoint] : [atPoint, atFull],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            fill: 'forwards',
            pseudoElement: goingDark
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)',
          },
        )
        await transition.finished
      } catch {
        // 页面失焦等情况可能跳过快照，仍等待主题提交完成并正常清理。
        if (transition) {
          transition.skipTransition()
          await transition.updateCallbackDone.catch(() => {})
          await transition.finished.catch(() => {})
        } else {
          commit()
        }
      } finally {
        root.classList.remove('theme-reveal')
        switching.current = false
      }
    },
    [],
  )

  return { theme, isDark: theme === 'dark', toggle }
}
