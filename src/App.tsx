import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'
import Footer from './components/Footer.tsx'
import LetterIntro from './components/LetterIntro.tsx'
import ThemePull from './components/ThemePull.tsx'

const App = () => {
  const location = useLocation()
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
    </>
  )
}

export default App
