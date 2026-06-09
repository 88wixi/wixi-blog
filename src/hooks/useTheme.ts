import { useCallback, useState } from 'react'
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
 * （由调用方传入），半径覆盖到最远的屏幕角，新主题快照从这一点扩散铺满整页。
 * 不支持的浏览器退回到 .theme-transition 的全局色彩渐变。
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  const toggle = useCallback(
    async (origin?: Origin) => {
      const next: Theme = theme === 'dark' ? 'light' : 'dark'
      const root = document.documentElement

      const commit = () => {
        flushSync(() => setTheme(next))
        applyTheme(next)
      }

      // 不支持 View Transitions（或用户偏好减少动效）：退回整页色彩渐变
      if (!document.startViewTransition || !origin || prefersReducedMotion()) {
        root.classList.add('theme-transition')
        commit()
        window.setTimeout(() => root.classList.remove('theme-transition'), 700)
        return
      }

      // 先让 View Transition 拍好新旧两张快照，再手动驱动圆形揭示
      await document.startViewTransition(commit).ready

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
          // 关灯：旧明亮层从满屏「收敛」到开关；开灯：新明亮层从开关「发散」铺满
          clipPath: goingDark ? [atFull, atPoint] : [atPoint, atFull],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          // forwards：保留终点裁剪状态，避免收敛到 0 后白层回弹满屏导致末尾闪烁
          fill: 'forwards',
          // 关灯动旧层（露出底下暗色），开灯动新层（盖住底下暗色）
          pseudoElement: goingDark
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    },
    [theme],
  )

  return { theme, isDark: theme === 'dark', toggle }
}
