import { useState, useEffect, useRef, useMemo } from 'react'
import { dataApi } from '../lib/supabase'
import { PageHeader } from '../components/SharedUI'
import { SectionHeading, TeamLanyardRail } from '../components/ui'
import { ArrowUp } from 'lucide-react'

const GROUPS = [
  {
    id: 'executive-appointive',
    heading: 'Executive / Appointive Officials',
    subgroups: [
      { category: 'executive_board', label: 'Executive Board' },
      { category: 'undersecretary', label: 'Undersecretaries and Representatives' },
    ],
  },
  {
    id: 'legislative',
    heading: 'Legislative',
    subgroups: [
      { category: 'councilor', label: 'Councilors' },
      { category: 'year_representative', label: 'Year Representatives' },
    ],
  },
  {
    id: 'judiciary-comelec',
    heading: 'Judiciary / COMELEC Representatives',
    subgroups: [
      { category: 'comelec', label: 'COMELEC' },
      { category: 'judiciary', label: 'Judiciary' },
    ],
  },
  {
    id: 'faculty-staff',
    heading: 'Faculty and Staff',
    subgroups: [
      { category: 'adviser', label: null },
    ],
  },
]

export default function People() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [showTop, setShowTop] = useState(false)
  const lockUntil = useRef(0)
  const navHeightRef = useRef(76)
  const menuScrollRef = useRef(null)
  const tabRefs = useRef({})

  // Measure the real floating navbar height and store in --nav-h
  useEffect(() => {
    const headerEl =
      document.querySelector('header .hush-nav__bar') || document.querySelector('header')
    if (!headerEl) return

    const updateNavHeight = () => {
      const h = Math.round(headerEl.getBoundingClientRect().height) || 76
      navHeightRef.current = h
      document.documentElement.style.setProperty('--nav-h', `${h}px`)
    }

    updateNavHeight()

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        updateNavHeight()
      })
      observer.observe(headerEl)
      return () => observer.disconnect()
    }

    window.addEventListener('resize', updateNavHeight)
    return () => window.removeEventListener('resize', updateNavHeight)
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await dataApi.list('people')
        if (!ignore) setPeople(data || [])
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load people directory.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [])

  const categorized = useMemo(() => {
    const map = {}
    people.forEach((p) => {
      if (!map[p.category]) {
        map[p.category] = []
      }
      map[p.category].push(p)
    })
    return map
  }, [people])

  const lanyardByCategory = useMemo(() => {
    const map = {}
    GROUPS.forEach((group) => {
      group.subgroups.forEach((subgroup) => {
        const members = categorized[subgroup.category] || []
        const isFaculty = subgroup.category === 'adviser'
        const fallbackLabel = subgroup.label || group.heading
        map[subgroup.category] = members.map((person, index) => ({
          id: String(person.id),
          name: person.full_name,
          role: person.position,
          team: isFaculty
            ? person.committee || 'Faculty & Staff'
            : person.committee || fallbackLabel,
          image: person.photo_url || '',
          bio: person.committee || undefined,
          tags: [
            person.academic_year ? `A.Y. ${person.academic_year}` : null,
            fallbackLabel,
          ].filter(Boolean),
          links: person.email
            ? [{ label: 'Email', href: `mailto:${person.email}` }]
            : [],
          tone: (index % 5) + 1,
        }))
      })
    })
    return map
  }, [categorized])

  const activeGroups = GROUPS.filter((g) =>
    g.subgroups.some((sg) => (categorized[sg.category] || []).length > 0)
  )

  useEffect(() => {
    if (activeGroups.length === 0) return
    const onScroll = () => {
      if (Date.now() < lockUntil.current) return
      setShowTop(window.scrollY > 600)
      const navOffset = navHeightRef.current || 76
      let current = activeGroups[0].id
      for (const g of activeGroups) {
        const el = document.getElementById(g.id)
        if (el && el.getBoundingClientRect().top <= navOffset + 130) {
          current = g.id
        }
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = activeGroups[activeGroups.length - 1].id
      }
      setActiveId(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people])

  useEffect(() => {
    if (!activeId) return
    const container = menuScrollRef.current
    const activeBtn = tabRefs.current[activeId]
    if (!container || !activeBtn) return

    const targetLeft =
      activeBtn.offsetLeft - container.clientWidth / 2 + activeBtn.offsetWidth / 2
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    })
  }, [activeId])

  return (
    <div id="main-content" className="selens-paper-page min-h-screen">
      <PageHeader
        title="People &amp; Leadership"
        description="Meet the officers, legislative representatives, and faculty advisers serving the Society of Electrical Engineering Students for A.Y. 2026–2027."
      />

      <div className="selens-container py-10 sm:py-14 space-y-12">
        {loading ? (
          <div className="space-y-8">
            <div className="h-[340px] bg-[#d9dce0] rounded-[28px] animate-pulse" />
            <div className="h-[340px] bg-[#d9dce0] rounded-[28px] animate-pulse" />
          </div>
        ) : error ? (
          <div className="m-surface text-center m-text-6 text-red-700">
            {error}
          </div>
        ) : people.length === 0 ? (
          <div className="m-surface text-center py-12 m-text-6 text-[#4d5158]">
            The officer directory has not been published yet. Check back soon.
          </div>
        ) : (
          <>
            {/* Sticky Pill Group Menu */}
            {activeGroups.length > 0 && (
              <nav
                className="sticky z-30 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 bg-[#e7e8ea]/90 backdrop-blur-md"
                style={{ top: 'calc(var(--nav-h, 76px) - 2px)' }}
                aria-label="People Directory Navigation"
              >
                <div
                  ref={menuScrollRef}
                  className="flex items-center gap-2 overflow-x-auto whitespace-nowrap snap-x snap-mandatory selens-no-scrollbar selens-edge-fade"
                >
                  {activeGroups.map((group) => {
                    const isCurrent = activeId === group.id
                    return (
                      <button
                        key={group.id}
                        ref={(el) => {
                          tabRefs.current[group.id] = el
                        }}
                        type="button"
                        onClick={() => {
                          lockUntil.current = Date.now() + 1000
                          setActiveId(group.id)
                          document
                            .getElementById(group.id)
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                        className={`snap-start shrink-0 min-h-[42px] px-5 py-2 m-text-4 rounded-full transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#121315] text-white'
                            : 'bg-white text-[#121315] hover:bg-[#d9dce0]'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-[#FFD100]" aria-hidden="true" />
                          )}
                          <span>{group.heading}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </nav>
            )}

            {/* Branch Sections with Interactive TeamLanyardRail */}
            <div className="space-y-16">
              {activeGroups.map((group) => (
                <section
                  key={group.id}
                  id={group.id}
                  style={{ scrollMarginTop: 'calc(var(--nav-h, 76px) + 5rem)' }}
                  className="space-y-8"
                >
                  <SectionHeading
                    tone="paper"
                    title={group.heading}
                    reveal={false}
                  />

                  <div className="space-y-10">
                    {group.subgroups.map((subgroup) => {
                      const items = lanyardByCategory[subgroup.category] || []
                      if (items.length === 0) return null

                      return (
                        <div key={subgroup.category} className="space-y-3.5">
                          {subgroup.label && (
                            <div className="flex items-baseline justify-between gap-3 px-1">
                              <h3 className="m-text-5 text-[#121315]">
                                {subgroup.label}
                              </h3>
                              <span className="m-text-6 text-[#4d5158]">
                                {items.length} {items.length === 1 ? 'member' : 'members'}
                              </span>
                            </div>
                          )}

                          <TeamLanyardRail
                            items={items}
                            caption="Hover, drag, pull down, or click a badge to flip"
                          />
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 m-btn m-shadow"
        >
          <span className="m-btn__label">
            <ArrowUp className="w-4 h-4" />
            <span>Back to top</span>
          </span>
        </button>
      )}
    </div>
  )
}
