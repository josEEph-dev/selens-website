import { useState, useEffect, useRef, useMemo } from 'react'
import { dataApi } from '../lib/supabase'
import { PageHeader } from '../components/SharedUI'
import { SectionHeading, TeamLanyardRail } from '../components/ui'
import { Mail, User, ArrowUp } from 'lucide-react'

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

function InitialsAvatar({ name, large = false }) {
  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
    : ''

  return (
    <div className="w-full h-full bg-selens-black flex items-center justify-center select-none">
      {initials ? (
        <span
          className={`font-serif font-bold text-selens-yellow text-base ${
            large ? 'sm:text-3xl' : 'sm:text-xl'
          }`}
        >
          {initials}
        </span>
      ) : (
        <User className={`text-neutral-600 w-6 h-6 ${large ? 'sm:w-10 sm:h-10' : 'sm:w-8 sm:h-8'}`} />
      )}
    </div>
  )
}

function PersonCard({ person, large = false, isFaculty = false }) {
  const [imgError, setImgError] = useState(false)

  return (
    <article className="selens-card h-full min-h-[136px] sm:min-h-0 p-3.5 sm:p-0 flex flex-row sm:flex-col items-center sm:items-stretch gap-3.5 sm:gap-0 overflow-hidden">
      {/* Avatar / Photo Area: 64px square on <640px, aspect-[4/5] on >=640px */}
      <div className="w-16 h-16 sm:w-full sm:h-auto sm:aspect-[4/5] shrink-0 rounded-[4px] sm:rounded-none border border-selens-line sm:border-0 sm:border-b sm:border-selens-line bg-neutral-950 overflow-hidden relative flex items-center justify-center">
        {person.photo_url && !imgError ? (
          <img
            src={person.photo_url}
            alt={person.full_name}
            loading="lazy"
            className="w-full h-full object-cover object-top"
            onError={() => setImgError(true)}
          />
        ) : (
          <InitialsAvatar name={person.full_name} large={large} />
        )}
      </div>

      {/* Text & Contact Area */}
      <div className="flex-1 min-w-0 sm:p-4 flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0 flex-1 space-y-1 sm:space-y-1.5">
          {/* Name: font-serif, line-clamp-2, reserved 2-line height */}
          <h4
            title={person.full_name}
            className={`font-serif font-bold text-selens-white leading-snug line-clamp-2 min-h-[2.4375rem] break-words ${
              large
                ? 'text-sm sm:text-lg lg:text-xl sm:min-h-[3.125rem] lg:min-h-[3.5rem]'
                : 'text-sm sm:text-base sm:min-h-[2.75rem]'
            }`}
          >
            {person.full_name}
          </h4>

          {/* Position: line-clamp-3, reserved 3-line height */}
          <p
            title={person.position}
            className="text-xs sm:text-sm text-neutral-300 font-sans font-medium leading-snug line-clamp-3 min-h-[3.09375rem] sm:min-h-[3.625rem] break-words"
          >
            {person.position}
          </p>

          {/* Committee: small, line-clamp-1 on <640px, line-clamp-2 on >=640px, reserved height */}
          {!isFaculty && (
            <p
              title={person.committee || ''}
              className="text-xs text-neutral-400 font-sans leading-normal line-clamp-1 sm:line-clamp-2 min-h-[1.125rem] sm:min-h-[2.25rem] pt-0.5 break-words"
            >
              {person.committee || '\u00A0'}
            </p>
          )}
        </div>

        {/* Mobile (<640px): Icon-only email link */}
        {person.email && (
          <a
            href={`mailto:${person.email}`}
            aria-label={`Email ${person.full_name}`}
            title={person.email}
            className="sm:hidden w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-[4px] border border-selens-line bg-selens-black text-neutral-300 hover:text-selens-yellow hover:border-selens-yellow transition-colors"
          >
            <Mail className="w-4 h-4" />
          </a>
        )}

        {/* Tablet/Desktop (>=640px): Footer email row with reserved height */}
        <div className="hidden sm:flex items-center pt-2.5 border-t border-selens-line min-h-[2.25rem]">
          {person.email ? (
            <a
              href={`mailto:${person.email}`}
              title={person.email}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-selens-yellow transition-colors min-w-0 max-w-full"
            >
              <Mail className="w-3.5 h-3.5 shrink-0 text-selens-yellow" />
              <span className="truncate">{person.email}</span>
            </a>
          ) : (
            <span className="text-xs text-neutral-600 select-none">&mdash;</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default function People() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [showTop, setShowTop] = useState(false)
  const lockUntil = useRef(0)
  const navHeightRef = useRef(80)
  const menuScrollRef = useRef(null)
  const tabRefs = useRef({})

  // Measure the real navbar height with ResizeObserver and store in --nav-h
  useEffect(() => {
    const headerEl = document.querySelector('header')
    if (!headerEl) return

    const updateNavHeight = () => {
      const h = Math.round(headerEl.getBoundingClientRect().height) || 80
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

  // Group people by category
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

  const execBoardItems = useMemo(
    () =>
      (categorized.executive_board || []).map((person, index) => ({
        id: String(person.id),
        name: person.full_name,
        role: person.position,
        team: person.committee || 'Executive Board',
        image: person.photo_url || '',
        bio: person.committee || undefined,
        tags: [
          person.academic_year ? `A.Y. ${person.academic_year}` : null,
          'Executive Board',
        ].filter(Boolean),
        links: person.email
          ? [{ label: 'Email', href: `mailto:${person.email}` }]
          : [],
        tone: (index % 5) + 1,
      })),
    [categorized]
  )

  // Determine non-empty groups for anchor menu and rendering
  const activeGroups = GROUPS.filter((g) =>
    g.subgroups.some((sg) => (categorized[sg.category] || []).length > 0)
  )

  // Track which group is in view, and when to show "Back to top"
  useEffect(() => {
    if (activeGroups.length === 0) return
    const onScroll = () => {
      if (Date.now() < lockUntil.current) return
      setShowTop(window.scrollY > 600)
      const navOffset = navHeightRef.current || 80
      let current = activeGroups[0].id
      for (const g of activeGroups) {
        const el = document.getElementById(g.id)
        if (el && el.getBoundingClientRect().top <= navOffset + 130) {
          current = g.id
        }
      }
      // At the very bottom of the page, the last group is the active one
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

  // Keep active tab scrolled horizontally into view inside the sticky menu
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
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title="People &amp; Leadership"
        description="Meet the officers, legislative representatives, and faculty advisers serving the Society of Electrical Engineering Students for A.Y. 2026–2027."
      />

      <div className="selens-container py-12 sm:py-16 space-y-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="h-32 sm:h-72 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
            <div className="h-32 sm:h-72 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
            <div className="h-32 sm:h-72 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
          </div>
        ) : error ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-red-400">
            {error}
          </div>
        ) : people.length === 0 ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400">
            The officer directory has not been published yet. Check back soon.
          </div>
        ) : (
          <>
            {/* Sticky Group Menu */}
            {activeGroups.length > 0 && (
              <nav
                className="sticky z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-selens-black/95 backdrop-blur-md border-b border-selens-line"
                style={{ top: 'var(--nav-h, 80px)' }}
                aria-label="People Directory Navigation"
              >
                <div
                  ref={menuScrollRef}
                  className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-2.5 snap-x snap-mandatory selens-no-scrollbar selens-edge-fade"
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
                        className={`snap-start shrink-0 min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-[4px] border transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-selens-yellow border-selens-yellow text-selens-black'
                            : 'bg-selens-ink border-selens-line text-neutral-300 hover:border-selens-yellow hover:text-selens-yellow'
                        }`}
                      >
                        {group.heading}
                      </button>
                    )
                  })}
                </div>
              </nav>
            )}

            {/* Groups */}
            <div className="space-y-16 sm:space-y-20">
              {activeGroups.map((group) => (
                <section
                  key={group.id}
                  id={group.id}
                  style={{ scrollMarginTop: 'calc(var(--nav-h, 80px) + 4.75rem)' }}
                  className="space-y-8"
                >
                  <SectionHeading title={group.heading} reveal={false} />

                  <div className="space-y-10">
                    {group.subgroups.map((subgroup) => {
                      const members = categorized[subgroup.category] || []
                      if (members.length === 0) return null

                      const isExec = subgroup.category === 'executive_board'
                      const isAdviser = subgroup.category === 'adviser'

                      return (
                        <div key={subgroup.category} className="space-y-4">
                          {subgroup.label && (
                            <h3 className="font-serif text-base sm:text-lg font-bold text-selens-yellow">
                              {subgroup.label}
                            </h3>
                          )}

                          {isExec ? (
                            <TeamLanyardRail
                              items={execBoardItems}
                              caption="Hover, drag, pull down, or click an officer badge to flip"
                            />
                          ) : (
                            <div className="grid grid-cols-1 auto-rows-fr gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                              {members.map((person) => (
                                <PersonCard
                                  key={person.id}
                                  person={person}
                                  large={false}
                                  isFaculty={isAdviser}
                                />
                              ))}
                            </div>
                          )}
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
          className="fixed bottom-6 right-6 z-40 min-h-[44px] inline-flex items-center gap-2 bg-selens-yellow text-selens-black text-sm font-bold px-4 py-2 rounded-[4px] border border-selens-yellow hover:bg-selens-white hover:border-selens-white transition-colors cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
          <span>Back to top</span>
        </button>
      )}
    </div>
  )
}
