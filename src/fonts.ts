// 自托管字体（@fontsource，unicode-range 切片、font-display: swap）。
// 单独一个模块、由 main.tsx 动态 import：6 个字重的 @font-face 声明合计约 325KB gzip，
// 若并进主 CSS 会变成渲染阻塞项；拆出来异步加载，首屏先用系统字体
// （PingFang / 微软雅黑，见 index.css 的 --font-sans/--font-serif 回退栈），字体就绪后再换上。
import '@fontsource/noto-sans-sc/400.css'
import '@fontsource/noto-sans-sc/500.css'
import '@fontsource/noto-sans-sc/700.css'
import '@fontsource/noto-serif-sc/400.css'
import '@fontsource/noto-serif-sc/500.css'
import '@fontsource/noto-serif-sc/700.css'
