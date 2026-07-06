import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'wixi-letter-seen'

type Phase = 'closed' | 'open' | 'gone'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const LetterIntro = () => {
  // 初始即决定是否需要展示, 避免首屏闪烁
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window === 'undefined') return 'gone'
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return 'gone'
    } catch {
      /* sessionStorage 不可用时仍照常展示 */
    }
    return 'closed'
  })
  const timers = useRef<number[]>([])
  const phaseRef = useRef<Phase>(phase)
  phaseRef.current = phase

  const push = (fn: () => void, delay: number) =>
    timers.current.push(window.setTimeout(fn, delay))

  // 自动折开
  useEffect(() => {
    if (phase !== 'closed') return
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* 忽略写入失败 */
    }

    if (prefersReducedMotion()) {
      push(() => setPhase('gone'), 200)
    } else {
      push(() => setPhase('open'), 750) // 四片封盖朝四边折开
      push(() => setPhase('gone'), 3400) // 折开后移除遮罩
    }

    return () => timers.current.forEach((id) => window.clearTimeout(id))
    // 只在挂载时启动一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 展示期间锁定背景滚动
  useEffect(() => {
    if (phase === 'gone') return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [phase])

  // 封盖未开时, 把网站这一层缩小压在信封内; 一旦折开便放大升起, 像被抽出
  useEffect(() => {
    const root = document.documentElement
    if (phase === 'closed') root.classList.add('intro-sealed')
    else root.classList.remove('intro-sealed')
    return () => root.classList.remove('intro-sealed')
  }, [phase])

  // 点击可提前折开 / 跳过
  const skip = () => {
    const p = phaseRef.current
    if (p === 'gone') return
    timers.current.forEach((id) => window.clearTimeout(id))
    if (p === 'closed') {
      setPhase('open')
      push(() => setPhase('gone'), 2650)
    } else {
      setPhase('gone')
    }
  }

  // 键盘也能跳过（Esc / Enter / 空格）：遮罩不可聚焦，只能挂在 window 上
  useEffect(() => {
    if (phase === 'gone') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // skip 走 phaseRef，不需要进依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (phase === 'gone') return null

  const isOpen = phase === 'open'

  return (
    <div
      className={`env-cover${isOpen ? ' is-open' : ''}`}
      role="presentation"
      aria-hidden="true"
      onClick={skip}
    >
      <div className="efold efold-top" />
      <div className="efold efold-bottom" />
      <div className="efold efold-left" />
      <div className="efold efold-right" />
      <div className="env-cover-seal">w</div>
    </div>
  )
}

export default LetterIntro
