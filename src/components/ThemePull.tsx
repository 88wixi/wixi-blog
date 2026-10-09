import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useTheme } from '../hooks/useTheme.ts'

/** 右上角垂下的灯具拉绳：拉一下，从灯泡处圆形扩散切换暗黑 / 明亮模式。 */
const ThemePull = () => {
  const { isDark, toggle } = useTheme()
  const cordRef = useRef<HTMLSpanElement>(null)
  const knobRef = useRef<HTMLSpanElement>(null)
  const [pulling, setPulling] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    // 快照期间浏览器会清除 :hover；固定当前绳长，避免灯具先缩回再伸出。
    if (cordRef.current) {
      event.currentTarget.style.setProperty(
        '--theme-pull-cord-height',
        getComputedStyle(cordRef.current).height,
      )
    }
    setPulling(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPulling(false), 500)

    // 圆形揭示的原点 = 灯泡中心
    const rect = knobRef.current?.getBoundingClientRect()
    const origin = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : undefined
    void toggle(origin)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`theme-pull${pulling ? ' is-pulling' : ''}`}
      aria-pressed={isDark}
      aria-label={isDark ? '切换到明亮模式' : '切换到暗黑模式'}
      title={isDark ? '拉一下：开灯' : '拉一下：关灯'}
    >
      <span ref={cordRef} className="theme-pull__cord" aria-hidden="true" />
      <span ref={knobRef} className="theme-pull__knob" aria-hidden="true" />
    </button>
  )
}

export default ThemePull
