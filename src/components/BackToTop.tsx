import { useState } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { springScroll, springTouch } from '../lib/motion.ts'

// 滚动到一定距离后浮现的「回到顶部」按钮：
// 外圈是一道随阅读进度画满的珊瑚色细环，中心箭头 hover 时轻轻抬起，
// 呼应站点的纸墨手作气质（暗黑切换的拉灯绳同款思路）。
const R = 20 // 进度环半径
const C = 2 * Math.PI * R // 周长

const BackToTop = () => {
  const [visible, setVisible] = useState(false)

  // 进度环走 MotionValue：以前每个滚动事件都 setState，整个按钮逐帧重渲染；
  // 现在只有「越过 600px」这一次真正触发 React 更新，环本身在合成层上画。
  const { scrollY, scrollYProgress } = useScroll()
  const smoothProgress = useSpring(scrollYProgress, springScroll)
  const dashOffset = useTransform(smoothProgress, (p) => C * (1 - p))

  useMotionValueEvent(scrollY, 'change', (y) => setVisible(y > 600))

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="回到顶部"
          title="回到顶部"
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={springTouch}
          className="group fixed right-6 bottom-[28%] z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-paper-200/70 bg-paper-50/85 text-ink-700 shadow-[0_4px_16px_rgba(20,23,31,0.12)] backdrop-blur transition-colors hover:border-coral-400/60 hover:text-coral-500 hover:shadow-[0_6px_22px_rgba(238,106,58,0.22)] sm:right-12"
        >
          {/* 阅读进度环 */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden
          >
            <circle cx="24" cy="24" r={R} stroke="currentColor" strokeWidth="2" className="text-paper-200/60" />
            <motion.circle
              cx="24"
              cy="24"
              r={R}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-coral-400"
              strokeDasharray={C}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>

          {/* 中心箭头：hover 时轻轻上抬。这里仍用 CSS group-hover——父按钮的
              whileHover 传的是对象而非 variant 标签，不会向子级广播状态。 */}
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
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default BackToTop
