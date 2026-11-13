import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-[4px] border border-selens-yellow bg-selens-ink px-3.5 py-2 text-xs font-sans font-semibold text-selens-yellow hover:bg-selens-yellow hover:text-selens-black transition cursor-pointer"
    >
      <ArrowUp className="w-4 h-4" />
      <span>Back to top</span>
    </button>
  )
}
