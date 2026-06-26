import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'
import Footer from './components/Footer.tsx'
import LetterIntro from './components/LetterIntro.tsx'
import ThemePull from './components/ThemePull.tsx'
import BackToTop from './components/BackToTop.tsx'

const App = () => {
  const location = useLocation()

  // 路由切换后回到页面顶部：React Router 默认保留上一页的滚动位置，
  // 不复位的话点进新页面会停在上次滚动到的地方（看着像「一打开不在顶部」）。
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <LetterIntro />
      <ThemePull />
      <div id="app-shell" className="flex min-h-screen flex-col bg-paper-50 text-ink-900">
        <Navbar />
        <main className="flex-1">
          <div key={location.pathname} className="anim-page">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
      <BackToTop />
    </>
  )
}

export default App
