import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { PageHeader } from '../components/SharedUI'
import YearSelector from '../components/YearSelector'
import CommitteeFilter from '../components/CommitteeFilter'
import { ArrowUpRight, Archive } from 'lucide-react'
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

  useEffect(() => {
    setSelectedGroup('all')
    setSelectedCommittee('all')
  }, [category, selectedYear])

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
        title="Accomplishments &amp; Milestones"
        description="Celebrating student milestones, competition wins, community outreach initiatives, and organizational achievements."
      />

      <div className="selens-container py-10 sm:py-14 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cdd0d4] pb-5">
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

        <CommitteeFilter
          items={items}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          selectedCommittee={selectedCommittee}
          onCommitteeChange={setSelectedCommittee}
        />

        {isArchive && (
          <div className="m-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 m-text-6">
            <span className="flex items-center gap-2 text-[#121315]">
              <Archive className="w-4 h-4 text-[#4d5158] shrink-0" />
              <span>
                Viewing accomplishments archive for <strong className="font-medium">A.Y. {selectedYear}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear(CURRENT_ACADEMIC_YEAR)}
              className="m-link m-text-4 text-[#121315] w-fit cursor-pointer"
            >
              Back to current A.Y. {CURRENT_ACADEMIC_YEAR}
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 bg-white rounded-[20px] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="m-surface text-center m-text-6 text-red-700">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="m-surface py-12 text-center m-text-6 text-[#4d5158] space-y-4">
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
                  className="m-btn-2 m-btn-2--mist cursor-pointer"
                >
                  <span className="m-btn-2__label">View archive for A.Y. {pastYear}</span>
                </button>
              </div>
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="m-surface py-12 text-center m-text-6 text-[#4d5158]">
            No accomplishments matching the selected committee filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item, idx) => (
              <Reveal
                key={item.id}
                index={idx}
                className="m-surface grid grid-cols-1 md:grid-cols-12 gap-5 items-center transition-shadow hover:shadow-[0_22px_44px_-24px_rgba(18,19,21,0.45)] group"
              >
                {item.image_url && (
                  <Link
                    to={`/accomplishments/${item.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="md:col-span-3 block"
                  >
                    <ImageFrame tone="paper" src={item.image_url} aspect="aspect-[16/10]" />
                  </Link>
                )}

                <div className={`${item.image_url ? 'md:col-span-7' : 'md:col-span-10'} min-w-0 space-y-2`}>
                  <div className="flex flex-wrap items-center gap-2 m-text-6 text-[#4d5158]">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFD100] text-[#121315] text-xs font-medium">
                      {formatCategoryLabel(item.category)}
                    </span>
                    {item.committee && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#121315] text-white text-xs font-medium">
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

                  <h2 className="m-text-5 text-[#121315] group-hover:underline underline-offset-4 line-clamp-2 break-words">
                    <Link to={`/accomplishments/${item.slug}`} className="no-underline text-inherit">
                      {item.title}
                    </Link>
                  </h2>

                  {item.summary && (
                    <p className="m-text-6 text-[#4d5158] line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 flex md:justify-end shrink-0">
                  <Link
                    to={`/accomplishments/${item.slug}`}
                    aria-label={`Read details for ${item.title}`}
                    className="m-icon-btn"
                  >
                    <span className="m-icon-btn__icon" aria-hidden="true">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                    <span className="m-icon-btn__icon" aria-hidden="true">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
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
