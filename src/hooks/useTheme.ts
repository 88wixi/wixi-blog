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
 *
 * 无论开灯还是关灯，统一只驱动「新主题层」从开关向外扩散：旧层是过渡结束即销毁的
 * 临时快照，各浏览器（尤其 Edge/Chromium）对它的 fill / 销毁时机处理不一致，去动它
 * 会出现「圆心不在按钮上」的现象，所以只碰稳定的新层。
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

      root.animate(
        {
          // 新主题层始终从开关处（半径 0）向外扩散，铺满整屏盖住旧层
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    },
    [theme],
  )

  return { theme, isDark: theme === 'dark', toggle }
}
