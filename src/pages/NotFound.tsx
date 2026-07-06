import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle.ts'

const NotFound = () => {
  usePageTitle('页面不见了')
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-5 px-5 py-32 text-center sm:px-8">
      <p className="font-serif text-7xl text-ink-900">404</p>
      <p className="text-sm text-ink-500">这条小路好像被落叶盖住了。</p>
      <Link
        to="/"
        className="rounded-lg bg-ink-900 px-5 py-2.5 text-sm text-paper-50 hover:bg-ink-700"
      >
        ← 回到小记
      </Link>
    </div>
  )
}

export default NotFound
