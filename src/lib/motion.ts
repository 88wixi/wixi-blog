import type { Transition, Variants } from 'motion/react'

/**
 * 全站统一的动效口径。散落各处手写 spring 参数很容易越写越不像同一个网站，
 * 这里收口成几个「语气」，组件只挑语气、不调参数。
 *
 * 曲线沿用 index.css 里既有的 cubic-bezier(0.2, 0.7, 0.2, 1)——纸墨调性偏克制，
 * 起步快、收尾慢，不要回弹过头的橡皮筋感。
 */
export const EASE_PAPER = [0.2, 0.7, 0.2, 1] as const

/** 布局位移（layoutId 滑动、卡片重排）：略带阻尼，落位干脆不抖 */
export const springLayout: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
  mass: 0.8,
}

/** 手感反馈（hover 抬起、按下回弹）：更软一点，像纸被指尖挑起 */
export const springTouch: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 22,
  mass: 0.6,
}

/** 滚动进度条 / 进度环：跟手但不抽搐 */
export const springScroll: Transition = {
  stiffness: 120,
  damping: 28,
  restDelta: 0.001,
}

/** 列表容器：子项依次入场 */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
}

/** 列表子项：与 index.css 的 .reveal-item 视觉一致（上移 16px 淡入） */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_PAPER },
  },
  // 筛选时被移除的卡片：就地缩一点淡出，不要位移，避免和 layout 重排打架
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}
