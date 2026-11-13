import { useEffect, useState } from 'react'

// Change NAV_OFFSET to your main navbar height in px (try 72 to 96).
const NAV_OFFSET = 80

export default function StickyGroupMenu({ groups }) {
  // groups = [{ id: 'executive', label: 'Executive / Appointive' }, ...]
  const [active, setActive] = useState(groups[0]?.id)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 600)
      let current = groups[0]?.id
      for (const g of groups) {
        const el = document.getElementById(g.id)
        if (el && el.getBoundingClientRect().top - NAV_OFFSET - 60 <= 0) {
          current = g.id
        }
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [groups])

  const jump = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <div
        className="sticky z-30 border-b-2 border-yellow-400 bg-black"
        style={{ top: NAV_OFFSET }}
      >
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto whitespace-nowrap px-4 py-3">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => jump(g.id)}
              className={
                'shrink-0 px-4 py-2 text-sm font-semibold transition ' +
                (active === g.id
                  ? 'bg-yellow-400 text-black'
                  : 'text-white hover:text-yellow-400')
              }
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 bg-yellow-400 px-4 py-2 text-sm font-bold text-black shadow-lg"
        >
          Back to top
        </button>
      )}
    </>
  )
}