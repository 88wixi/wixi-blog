import { useEffect, useState } from 'react'

// 滚动到一定距离后浮现的「回到顶部」按钮：
// 外圈是一道随阅读进度画满的珊瑚色细环，中心箭头 hover 时轻轻抬起，
// 呼应站点的纸墨手作气质（暗黑切换的拉灯绳同款思路）。
const R = 20 // 进度环半径
const C = 2 * Math.PI * R // 周长

const BackToTop = () => {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      setVisible(y > 600)
      setProgress(max > 0 ? Math.min(y / max, 1) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="回到顶部"
      title="回到顶部"
      className={`group fixed right-5 bottom-[28%] z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-paper-200/70 bg-paper-50/85 text-ink-700 shadow-[0_4px_16px_rgba(20,23,31,0.12)] backdrop-blur transition-all duration-300 hover:border-coral-400/60 hover:text-coral-500 hover:shadow-[0_6px_22px_rgba(238,106,58,0.22)] sm:right-8 ${
        visible ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      {/* 阅读进度环 */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden
      >
        <circle cx="24" cy="24" r={R} stroke="currentColor" strokeWidth="2" className="text-paper-200/60" />
        <circle
          cx="24"
          cy="24"
          r={R}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-coral-400 transition-[stroke-dashoffset] duration-150 ease-out"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
        />
      </svg>

      {/* 中心箭头：hover 时轻轻上抬 */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative -translate-y-px transition-transform duration-300 group-hover:-translate-y-1"
      >
        <path d="M12 19V6M6 12l6-6 6 6" />
      </svg>
    </button>
  )
}

export default BackToTop
