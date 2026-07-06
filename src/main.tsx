import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import NotFound from './pages/NotFound.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
