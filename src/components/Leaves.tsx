import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_PAPER } from '../lib/motion.ts'

/**
 * 404 页上铺的一层落叶：划过去把叶子扫开，露出下面那条小路。
 *
 * 刻意**不做飘落**——飘落的叶子 + 鼠标扫开，在中文网站语境里就是 2005 年个人主页的
 * 雪花/樱花特效，墨线剪影也救不回来。这里是一张静物：进场直接淡入到设计好的位置，
 * 扫开就留在那儿，不飘回、不循环、没有常驻动画。
 *
 * 坐标写死（不用随机）：构图是排过的，每次一致，也刻意避开正中间返回按钮的矩形——
 * 文案说落叶盖住了路，实现上千万别真把出口盖住。
 */
type Leaf = { x: number; y: number; r: number; s: number; dx: number; dy: number }

// x/y 是容器百分比；dx/dy 是被扫开后的位移（px）；r 旋转；s 缩放
const LEAVES: Leaf[] = [
  { x: 8, y: 12, r: -20, s: 1.0, dx: -70, dy: -34 },
  { x: 22, y: 31, r: 15, s: 0.82, dx: -58, dy: 30 },
  { x: 12, y: 62, r: 40, s: 0.95, dx: -76, dy: 18 },
  { x: 30, y: 82, r: -35, s: 0.88, dx: -40, dy: 62 },
  { x: 50, y: 8, r: 8, s: 0.9, dx: 12, dy: -64 },
  { x: 70, y: 22, r: -28, s: 1.05, dx: 66, dy: -30 },
  { x: 85, y: 45, r: 25, s: 0.85, dx: 78, dy: 12 },
  { x: 90, y: 74, r: -12, s: 0.95, dx: 72, dy: 40 },
  { x: 62, y: 89, r: 30, s: 0.8, dx: 44, dy: 58 },
  { x: 44, y: 93, r: -18, s: 1.0, dx: -8, dy: 66 },
  { x: 5, y: 40, r: 55, s: 0.75, dx: -80, dy: -8 },
  { x: 77, y: 61, r: -50, s: 0.9, dx: 74, dy: 26 },
]

const SWEEP_RADIUS = 66 // 指针离叶心多近算扫到

const Leaves = () => {
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [count, setCount] = useState(LEAVES.length)
  const [swept, setSwept] = useState<boolean[]>(() => LEAVES.map(() => false))

  // 窄屏少铺几片：低端机上同时动的元素少一半
  useEffect(() => {
    const narrow = window.matchMedia('(max-width: 640px)').matches
    setCount(narrow ? 8 : LEAVES.length)
  }, [])

  const onMove = useCallback(
    (e: PointerEvent) => {
      const rect = wrapRef.current?.getBoundingClientRect()
      if (!rect) return
      setSwept((prev) => {
        let changed = false
        const next = prev.slice()
        for (let i = 0; i < count; i += 1) {
          if (next[i]) continue
          const leaf = LEAVES[i]
          const cx = rect.left + (leaf.x / 100) * rect.width
          const cy = rect.top + (leaf.y / 100) * rect.height
          if (Math.hypot(e.clientX - cx, e.clientY - cy) < SWEEP_RADIUS) {
            next[i] = true
            changed = true
          }
        }
        return changed ? next : prev
      })
    },
    [count],
  )

  useEffect(() => {
    // reduced-motion 下整段关掉扫叶：留一张构图完整的静物就够了
    if (reduce) return
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [onMove, reduce])

  const sweptCount = swept.slice(0, count).filter(Boolean).length
  const cleared = sweptCount / count >= 0.7

  return (
    <>
      {/* 叶层：绝对铺满、不吃指针事件、对读屏隐藏 */}
      <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0">
        <svg width="0" height="0" className="absolute">
          <defs>
            {/* 一片墨线叶子，靠 <use> 复用 */}
            <path
              id="leaf-shape"
              d="M12 2C7 5 3 9 3 14a9 9 0 0 0 9 8 9 9 0 0 0 9-8c0-5-4-9-9-12zM12 4v16"
            />
          </defs>
        </svg>
        {LEAVES.slice(0, count).map((leaf, i) => (
          <motion.span
            key={i}
            className="absolute text-sage-500/50"
            style={{ left: `${leaf.x}%`, top: `${leaf.y}%` }}
            initial={{ opacity: 0, scale: leaf.s * 0.8 }}
            animate={{
              opacity: swept[i] ? 0 : 0.9,
              scale: leaf.s,
              x: swept[i] ? leaf.dx : 0,
              y: swept[i] ? leaf.dy : 0,
              rotate: swept[i] ? leaf.r + 55 : leaf.r,
            }}
            transition={
              swept[i]
                ? { duration: 0.5, ease: EASE_PAPER }
                : { duration: 0.4, delay: i * 0.04, ease: EASE_PAPER }
            }
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <use href="#leaf-shape" />
            </svg>
          </motion.span>
        ))}
      </div>

      {/* 扫开够多之后，露出脚下那条小路 */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-2">
        <svg width="200" height="26" viewBox="0 0 200 26" fill="none">
          <motion.path
            d="M4 21C40 21 52 6 92 6s58 15 104 15"
            stroke="currentColor"
            className="text-sage-500/60"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="5 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: cleared ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.9, ease: EASE_PAPER }}
          />
        </svg>
        <motion.span
          className="font-serif text-xs text-ink-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: cleared ? 1 : 0 }}
          transition={{ duration: 0.5, delay: cleared ? 0.5 : 0 }}
        >
          路找回来了。
        </motion.span>
      </div>
    </>
  )
}

export default Leaves
