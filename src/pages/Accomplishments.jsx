import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { PageHeader } from '../components/SharedUI'
import YearSelector from '../components/YearSelector'
import CommitteeFilter from '../components/CommitteeFilter'
import { ArrowRight, Archive } from 'lucide-react'
import { ImageFrame, Reveal } from '../components/ui'
import { CURRENT_ACADEMIC_YEAR, getGroupForCommittee, formatCommitteeLabel } from '../lib/config'

const CATEGORIES = [
  { id: 'all', label: 'All Accomplishments' },
  { id: 'academic', label: 'Academic' },
  { id: 'competition', label: 'Competition' },
  { id: 'community_outreach', label: 'Community Outreach' },
  { id: 'organizational', label: 'Organizational' },
  { id: 'other', label: 'Other' },
]

export default function Accomplishments() {
  const [items, setItems] = useState([])
  const [category, setCategory] = useState('all')
  const [availableYears, setAvailableYears] = useState([CURRENT_ACADEMIC_YEAR])
  const [selectedYear, setSelectedYear] = useState(CURRENT_ACADEMIC_YEAR)
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [selectedCommittee, setSelectedCommittee] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Discover distinct academic years
  useEffect(() => {
    let ignore = false
    async function loadYears() {
      try {
        const { data, error: yrErr } = await supabase
          .from('accomplishments')
          .select('academic_year')
        if (yrErr) throw yrErr
        if (!ignore && data) {
          const yearsSet = new Set([
            CURRENT_ACADEMIC_YEAR,
            ...data.map((d) => d.academic_year).filter(Boolean),
          ])
          const sorted = Array.from(yearsSet).sort().reverse()
          setAvailableYears(sorted)
        }
      } catch (err) {
        console.error('Error fetching accomplishment academic years:', err)
      }
    }
    loadYears()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        let query = supabase
          .from('accomplishments')
          .select('id, title, slug, summary, body, category, accomplished_on, image_url, academic_year, committee, created_at')
          .order('accomplished_on', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })

        if (category && category !== 'all') {
          query = query.eq('category', category)
        }

        if (selectedYear) {
          query = query.eq('academic_year', selectedYear)
        }

        const { data, error: queryError } = await query
        if (queryError) throw queryError
        if (!ignore) setItems(data || [])
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load accomplishments.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [category, selectedYear])

  // Reset group and committee filters when switching category or year
  useEffect(() => {
    setSelectedGroup('all')
    setSelectedCommittee('all')
  }, [category, selectedYear])

  // Filter items by group and committee
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemGroup = getGroupForCommittee(item.committee)
      if (selectedGroup !== 'all' && itemGroup !== selectedGroup) {
        return false
      }
      if (selectedGroup === 'Legislative' && selectedCommittee !== 'all' && item.committee !== selectedCommittee) {
        return false
      }
      return true
    })
  }, [items, selectedGroup, selectedCommittee])

  const isArchive = selectedYear !== CURRENT_ACADEMIC_YEAR
  const pastYear = availableYears.find((y) => y !== CURRENT_ACADEMIC_YEAR)

  const formatCategoryLabel = (cat) => {
    const found = CATEGORIES.find((c) => c.id === cat)
    return found ? found.label : cat?.replace('_', ' ') || 'General'
  }

  return (
    <div id="main-content" className="selens-paper-page min-h-screen">
      <PageHeader
        eyebrow="Chapter Milestones"
        title="Accomplishments &amp; Milestones"
        description="Celebrating student milestones, competition wins, community outreach initiatives, and organizational achievements."
      />

      <div className="selens-container py-12 sm:py-16 space-y-8">
        {/* Category filters & Year selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-selens-paper-rule pb-5">
          <div className="selens-chip-row" role="group" aria-label="Filter by category">
            {CATEGORIES.map((tab) => {
              const isActive = category === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setCategory(tab.id)}
                  type="button"
                  aria-pressed={isActive}
                  className="selens-chip"
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <YearSelector
            years={availableYears}
            selectedYear={selectedYear}
            onChange={setSelectedYear}
          />
        </div>

        {/* Group and Committee Chips */}
        <CommitteeFilter
          items={items}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          selectedCommittee={selectedCommittee}
          onCommitteeChange={setSelectedCommittee}
        />

        {isArchive && (
          <div className="p-4 bg-selens-paper-alt border border-selens-paper-rule rounded-[3px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-selens-paper-ink">
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-selens-yellow-ink shrink-0" />
              <span>
                Viewing accomplishments archive for <strong>A.Y. {selectedYear}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear(CURRENT_ACADEMIC_YEAR)}
              className="font-bold underline decoration-selens-yellow decoration-2 underline-offset-4 hover:text-selens-paper-muted cursor-pointer"
            >
              Back to current A.Y. {CURRENT_ACADEMIC_YEAR}
            </button>
          </div>
        )}

        {loading ? (
          <div className="divide-y divide-selens-paper-rule border-t-2 border-selens-paper-ink">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-selens-paper-alt/70 my-3 rounded-[2px] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="border-y border-red-300 bg-red-50 p-8 text-center text-sm text-red-800">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="border-y border-selens-paper-rule py-12 text-center text-sm text-selens-paper-muted space-y-3">
            <p>
              {selectedYear === CURRENT_ACADEMIC_YEAR
                ? `New updates for A.Y. ${CURRENT_ACADEMIC_YEAR} are coming soon.`
                : `No accomplishments recorded in this category for A.Y. ${selectedYear}.`}
            </p>
            {selectedYear === CURRENT_ACADEMIC_YEAR && pastYear && (
              <div>
                <button
                  type="button"
                  onClick={() => setSelectedYear(pastYear)}
                  className="selens-editorial-link text-xs"
                >
                  View archive for A.Y. {pastYear}
                </button>
              </div>
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="border-y border-selens-paper-rule py-12 text-center text-sm text-selens-paper-muted">
            No accomplishments matching the selected committee filter.
          </div>
        ) : (
          <div className="divide-y divide-selens-paper-rule border-t-2 border-b border-selens-paper-ink">
            {filteredItems.map((item, idx) => (
              <Reveal
                key={item.id}
                index={idx}
                className="py-6 sm:py-8 px-2 sm:px-3 hover:bg-selens-paper-alt/70 transition-colors grid grid-cols-1 md:grid-cols-12 gap-5 items-start md:items-center group"
              >
                {item.image_url && (
                  <Link
                    to={`/accomplishments/${item.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="md:col-span-3 rounded-[3px] overflow-hidden block"
                  >
                    <ImageFrame tone="paper" src={item.image_url} aspect="aspect-[16/10]" />
                  </Link>
                )}

                <div className={`${item.image_url ? 'md:col-span-7' : 'md:col-span-10'} min-w-0 space-y-2`}>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-selens-paper-muted font-mono">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider bg-selens-yellow text-selens-black px-2 py-0.5 rounded-[2px]">
                      {formatCategoryLabel(item.category)}
                    </span>
                    {item.committee && (
                      <span className="font-sans text-[11px] font-bold bg-selens-paper-ink text-selens-yellow px-2 py-0.5 rounded-[2px]">
                        {formatCommitteeLabel(item.committee)}
                      </span>
                    )}
                    {item.accomplished_on && (
                      <time dateTime={item.accomplished_on}>
                        {new Date(item.accomplished_on).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    )}
                  </div>

                  <h2 className="font-serif text-lg sm:text-xl font-bold text-selens-paper-ink group-hover:underline decoration-selens-yellow decoration-2 underline-offset-4 line-clamp-2 break-words leading-snug">
                    <Link to={`/accomplishments/${item.slug}`}>{item.title}</Link>
                  </h2>

                  {item.summary && (
                    <p className="text-sm sm:text-base text-selens-paper-muted line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 md:text-right shrink-0">
                  <Link to={`/accomplishments/${item.slug}`} className="selens-editorial-link text-xs">
                    <span>Read details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
