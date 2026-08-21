import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import Leaves from '../components/Leaves.tsx'

const NotFound = () => {
  usePageTitle('页面不见了')
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-5 overflow-hidden px-5 py-32 text-center sm:px-8">
      {/* 铺一层落叶，划过去可以扫开（见 Leaves.tsx）。它在返回按钮下层、不吃点击 */}
      <Leaves />

      <p className="relative font-serif text-7xl text-ink-900">404</p>
      <p className="relative text-sm text-ink-500">这条小路好像被落叶盖住了。</p>
      <Link
        to="/"
        className="relative rounded-lg bg-ink-900 px-5 py-2.5 text-sm text-paper-50 transition-colors hover:bg-ink-700"
      >
        ← 回到小记
      </Link>
    </div>
  )
}

export default NotFound
