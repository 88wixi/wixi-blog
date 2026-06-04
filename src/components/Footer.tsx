const Footer = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-paper-200/70 bg-paper-100/40">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-5 py-6 text-xs text-ink-500 sm:px-8">
        <span className="font-serif">© {year} wixi · 林间小记</span>
      </div>
    </footer>
  )
}

export default Footer
