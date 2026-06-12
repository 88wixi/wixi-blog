import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base 由部署目标决定：
//   - Vercel / 本地：默认根路径 '/'
//   - GitHub Pages（项目站点）：CI 注入 VITE_BASE=/wixi-blog/
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
})
