import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue } from 'motion/react'
import { springTouch } from '../lib/motion.ts'

/** 蓄满需要的时长；按满墨最浓，短按墨最淡——但**怎么按都盖得上**，没有失败态 */
const CHARGE_MS = 900
/** 短按也至少这么浓，免得看起来像没盖上 */
const MIN_INK = 0.35

type Props = {
  /** 已盖过（含本次乐观更新） */
  stamped: boolean
  /** 计数，来自 Worker + KV */
  count: number
  /** 松手时触发，intensity 0~1 只影响墨色浓淡 */
  onStamp: (intensity: number) => void
}

/**
 * 文末的「读过」印章 —— 接管了原来那个心形点赞按钮的表现层。
 * 数据逻辑（KV 计数、乐观更新、localStorage 去重）仍在 LikeButton 里，一行没改。
 *
 * 交互：按住蓄力，边框由淡墨转成珊瑚色、印章一点点压下去；**松手一定落章**，
 * 按得越久墨越浓。刻意不做「没盖实」的失败态——长按作为唯一成功路径是可访问性反模式
 * （手部震颤、切换开关、语音控制的用户可能永远盖不实）。
 */
const ReadStamp = ({ stamped, count, onStamp }: Props) => {
  const charge = useMotionValue(0)
  const [ink, setInk] = useState(0)
  const [halo, setHalo] = useState(false)
  const [pressing, setPressing] = useState(false)
  const charging = useRef(false)
  const stampedRef = useRef(stamped)
  stampedRef.current = stamped

  // 已经盖过（比如从 localStorage 恢复）：直接把墨色补满，不播蓄力
  useEffect(() => {
    if (stamped && ink === 0) setInk(0.85)
  }, [stamped, ink])

  const start = useCallback(() => {
    if (stampedRef.current || charging.current) return
    charging.current = true
    setPressing(true)
    charge.set(0)
    animate(charge, 1, { duration: CHARGE_MS / 1000, ease: 'linear' })
    navigator.vibrate?.(8)
  }, [charge])

  const finish = useCallback(() => {
    if (!charging.current) return
    charging.current = false
    setPressing(false)
    // 不用 animate().then() 判完成——调过 stop() 之后 promise 的结算行为不可靠，
    // 直接读当前值就是「按了多久」
    const raw = charge.get()
    charge.stop()
    charge.set(0)
    if (stampedRef.current) return
    const intensity = MIN_INK + raw * (1 - MIN_INK)
    setInk(intensity)
    if (raw > 0.75) {
      setHalo(true)
      window.setTimeout(() => setHalo(false), 500)
    }
    onStamp(intensity)
  }, [charge, onStamp])

  const cancel = useCallback(() => {
    if (!charging.current) return
    charging.current = false
    setPressing(false)
    charge.stop()
    animate(charge, 0, { duration: 0.2 })
  }, [charge])

  // 印章的下压/回弹只走 animate（不要同时用 style.scale 绑 MotionValue——
  // 两条路都写 transform 会互相覆盖）。charge 那个 MotionValue 只驱动进度环的
  // pathLength，作用在另一个元素上，互不干扰。
  const phase: 'idle' | 'charging' | 'stamped' = stamped
    ? 'stamped'
    : pressing
      ? 'charging'
      : 'idle'
  const scaleAnim =
    phase === 'stamped'
      ? { scale: [0.88, 1.04, 1] }
      : phase === 'charging'
        ? { scale: 0.88 }
        : { scale: 1 }
  const scaleTransition =
    phase === 'charging'
      ? { duration: CHARGE_MS / 1000, ease: 'linear' as const }
      : phase === 'stamped'
        ? { duration: 0.42, ease: 'easeOut' as const }
        : springTouch

  return (
    // 读到文末才浮出来——阅读过程中完全不打扰
    <motion.div
      className="mt-14 flex flex-col items-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button
        type="button"
        aria-label={stamped ? '已盖过「读过」印' : '按住盖一枚「读过」印'}
        aria-pressed={stamped}
        disabled={stamped}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId)
          start()
        }}
        onPointerUp={finish}
        onPointerCancel={cancel}
        onKeyDown={(e) => {
          // keydown 会自动重复，忽略重复帧，否则一直在重启蓄力
          if (e.repeat) return
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            start()
          }
        }}
        onKeyUp={(e) => {
          if (e.key === 'Enter' || e.key === ' ') finish()
        }}
        onBlur={cancel}
        animate={scaleAnim}
        transition={scaleTransition}
        // touch-action / user-select / callout 三件套：不加的话 iOS 长按会弹系统菜单，
        // 直接把手势吃掉
        className="relative flex h-14 w-14 touch-none select-none items-center justify-center rounded-xl [-webkit-touch-callout:none] disabled:cursor-default"
      >
        {/* 墨晕：只在按满时散一圈，压得很淡、0.4s 内散尽 */}
        <AnimatePresence>
          {halo && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-xl bg-coral-500"
              initial={{ opacity: 0.18, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        <svg width="56" height="56" viewBox="0 0 64 64" aria-hidden>
          {/* 印底：盖过之后填上朱砂，浓淡由按压时长决定 */}
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="11"
            className="text-coral-500"
            fill="currentColor"
            style={{ opacity: stamped ? ink * 0.9 : 0, transition: 'opacity 0.35s ease-out' }}
          />
          {/* 空心边框（未盖时的淡墨轮廓） */}
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="11"
            fill="none"
            strokeWidth="2"
            className={stamped ? 'text-coral-600' : 'text-ink-300'}
            stroke="currentColor"
          />
          {/* 蓄力进度：沿印框描一圈。
              这里刻意用 <path> 而不是 <rect>——pathLength 归一化在 rect 上依赖 SVG2
              属性支持，各家浏览器参差；圆角矩形手写成 path 则处处可靠。 */}
          {!stamped && (
            <motion.path
              d="M17 6H47A11 11 0 0 1 58 17V47A11 11 0 0 1 47 58H17A11 11 0 0 1 6 47V17A11 11 0 0 1 17 6Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              className="text-coral-500"
              style={{ pathLength: charge }}
            />
          )}
          <text
            x="32"
            y="33"
            textAnchor="middle"
            dominantBaseline="middle"
            className={stamped ? 'fill-paper-50' : 'fill-ink-500'}
            style={{ fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: 1 }}
          >
            读过
          </text>
        </svg>
      </motion.button>

      <div className="flex items-center gap-2 text-xs text-ink-500">
        <span>{stamped ? '已经盖过了' : '按住盖一枚'}</span>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 0.75 }}
            transition={springTouch}
            className="font-mono"
          >
            {count}
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}

export default ReadStamp
