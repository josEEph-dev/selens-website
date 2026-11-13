import { useState, useEffect, useRef } from 'react'
import { dataApi } from '../lib/supabase'
import { PageHeader } from '../components/SharedUI'
import { Mail, User } from 'lucide-react'

// Height of your main navbar in px. Adjust if the sticky menu overlaps or leaves a gap.
const NAV_OFFSET = 80

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
    <div className="w-full h-full bg-selens-ink flex items-center justify-center">
      {initials ? (
        <span className={`font-serif font-bold text-selens-yellow ${large ? 'text-3xl' : 'text-xl'}`}>
          {initials}
        </span>
      ) : (
        <User className={`text-neutral-600 ${large ? 'w-10 h-10' : 'w-8 h-8'}`} />
      )}
    </div>
  )
}

function PersonCard({ person, large = false, isFaculty = false }) {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex flex-col overflow-hidden rounded-[4px] border border-selens-line bg-selens-ink">
      <div className="w-full aspect-[4/3] bg-neutral-900 overflow-hidden relative flex items-center justify-center">
        {person.photo_url && !imgError ? (
          <img
            src={person.photo_url}
            alt={person.full_name}
            className="w-full h-full object-cover object-top"
            onError={() => setImgError(true)}
          />
        ) : (
          <InitialsAvatar name={person.full_name} large={large} />
        )}
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between gap-3">
        <div className="space-y-1">
          <h4 className={`font-serif font-bold text-selens-white leading-snug ${large ? 'text-lg sm:text-xl' : 'text-base'}`}>
            {person.full_name}
          </h4>
          <p className="text-sm text-neutral-300 font-sans font-medium">
            {person.position}
          </p>
          {!isFaculty && person.committee && (
            <p className="text-xs text-neutral-400 font-sans leading-relaxed pt-0.5">
              {person.committee}
            </p>
          )}
        </div>

        {person.email && (
          <div className="pt-2 border-t border-selens-line">
            <a
              href={`mailto:${person.email}`}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-selens-yellow transition"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{person.email}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function People() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [showTop, setShowTop] = useState(false)
  const lockUntil = useRef(0)

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
    return () => { ignore = true }
  }, [])

  // Group people by category
  const categorized = {}
  people.forEach((p) => {
    if (!categorized[p.category]) {
      categorized[p.category] = []
    }
    categorized[p.category].push(p)
  })

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
      let current = activeGroups[0].id
      for (const g of activeGroups) {
        const el = document.getElementById(g.id)
        if (el && el.getBoundingClientRect().top <= NAV_OFFSET + 130) {
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

  return (
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title="People &amp; Leadership"
        description="Meet the officers, legislative representatives, and faculty advisers serving the Society of Electrical Engineering Students for A.Y. 2026–2027."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
            <div className="h-64 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
            <div className="h-64 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
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
            {/* Anchor Menu (sticky) */}
            {activeGroups.length > 0 && (
              <nav
                className="sticky z-30 -mt-4 bg-selens-black border-b-2 border-selens-yellow"
                style={{ top: NAV_OFFSET }}
                aria-label="People Directory Navigation"
              >
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap py-3">
                  {activeGroups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        lockUntil.current = Date.now() + 1000
                        setActiveId(group.id)
                        document
                          .getElementById(group.id)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-[4px] border outline-none transition ${
                        activeId === group.id
                          ? 'bg-selens-yellow border-selens-yellow text-black'
                          : 'bg-selens-ink border-selens-line text-neutral-300 hover:border-selens-yellow hover:text-selens-yellow'
                      }`}
                    >
                      {group.heading}
                    </button>
                  ))}
                </div>
              </nav>
            )}

            {/* Groups */}
            <div className="space-y-16">
              {activeGroups.map((group) => (
                <section key={group.id} id={group.id} className="space-y-8 scroll-mt-44">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-selens-white">
                      {group.heading}
                    </h2>
                    <div className="w-12 h-1 bg-selens-yellow mt-2" />
                  </div>

                  <div className="space-y-10">
                    {group.subgroups.map((subgroup) => {
                      const members = categorized[subgroup.category] || []
                      if (members.length === 0) return null

                      const isExec = subgroup.category === 'executive_board'
                      const isAdviser = subgroup.category === 'adviser'

                      return (
                        <div key={subgroup.category} className="space-y-4">
                          {subgroup.label && (
                            <h3 className="font-serif text-lg font-bold text-selens-yellow">
                              {subgroup.label}
                            </h3>
                          )}

                          <div
                            className={`grid gap-6 ${
                              isExec
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                            }`}
                          >
                            {members.map((person) => (
                              <PersonCard
                                key={person.id}
                                person={person}
                                large={isExec}
                                isFaculty={isAdviser}
                              />
                            ))}
                          </div>
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
          className="fixed bottom-6 right-6 z-40 bg-selens-yellow text-black text-sm font-bold px-4 py-2 rounded-[4px] shadow-lg"
        >
          Back to top
        </button>
      )}
    </div>
  )
}