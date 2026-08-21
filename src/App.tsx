import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import Navbar from './components/Navbar.tsx'
import Footer from './components/Footer.tsx'
import LetterIntro from './components/LetterIntro.tsx'
import ThemePull from './components/ThemePull.tsx'
import BackToTop from './components/BackToTop.tsx'
import { EASE_PAPER } from './lib/motion.ts'

const App = () => {
  const location = useLocation()
  // 用 useOutlet() 取「元素」而非渲染 <Outlet />：mode="wait" 期间旧页面要继续留在屏幕上
  // 播完退场。<Outlet /> 是读 context 的组件，路由一变它当场渲染成新页面，旧页面还没淡出
  // 就被换掉了；useOutlet() 返回的是已定型的元素，AnimatePresence 能原样把它留着。
  const outlet = useOutlet()

  return (
    <>
      <LetterIntro />
      <ThemePull />
      <div id="app-shell" className="flex min-h-screen flex-col bg-paper-50 text-ink-900">
        <Navbar />
        <main className="flex-1">
          {/* 路由切换：旧页面先淡出，退场结束再回到顶部并让新页面淡入。
              回顶放在 onExitComplete 而不是 pathname 的 effect 里——否则长页面会在
              旧内容还可见时突然弹回顶部；顺带也不再覆盖详情页自己的 #锚点深链定位。 */}
          <AnimatePresence
            mode="wait"
            initial={false}
            onExitComplete={() => window.scrollTo(0, 0)}
          >
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: EASE_PAPER }}
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      <BackToTop />
    </>
  )
}

export default App
