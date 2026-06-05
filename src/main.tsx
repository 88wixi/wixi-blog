import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import Articles from './pages/Articles.tsx'
import ArticleDetail from './pages/ArticleDetail.tsx'
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="articles" element={<Articles />} />
          <Route path="articles/:slug" element={<ArticleDetail />} />
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
