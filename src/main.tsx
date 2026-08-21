import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import './index.css'
// 字体异步加载（不阻塞首屏），原因见 fonts.ts。Google Fonts 在国内不稳定，已改为自托管。
void import('./fonts.ts')
import App from './App.tsx'
import Home from './pages/Home.tsx'
import Articles from './pages/Articles.tsx'
// 文章详情带 Markdown 渲染依赖，按需加载，避免拖慢首屏。
const ArticleDetail = lazy(() => import('./pages/ArticleDetail.tsx'))
import Photos from './pages/Photos.tsx'
import PhotoCity from './pages/PhotoCity.tsx'
import About from './pages/About.tsx'
import Gear from './pages/Gear.tsx'
import Travel from './pages/Travel.tsx'
// 404 带着落叶彩蛋，同步 import 会把它打进**所有人**的首屏包。
// 走错路的人才需要它，按需加载。
const NotFound = lazy(() => import('./pages/NotFound.tsx'))

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    {/* reducedMotion="user"：跟随系统「减少动态效果」，自动关掉所有位移/缩放，
        只保留透明度过渡。index.css 里已有的同名媒体查询管 CSS 动画，这层管 Motion。 */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="articles" element={<Articles />} />
            <Route
              path="articles/:slug"
              element={
                <Suspense fallback={<div className="px-5 py-24 text-center text-sm text-ink-500">载入中…</div>}>
                  <ArticleDetail />
                </Suspense>
              }
            />
            <Route path="photos" element={<Photos />} />
            <Route path="photos/:city" element={<PhotoCity />} />
            <Route path="about" element={<About />} />
            <Route path="gear" element={<Gear />} />
            <Route path="travel" element={<Travel />} />
            <Route
              path="*"
              element={
                <Suspense fallback={<div className="px-5 py-24 text-center text-sm text-ink-500">载入中…</div>}>
                  <NotFound />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
)
