import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { PageHeader } from '../components/SharedUI'
import YearSelector from '../components/YearSelector'
import CommitteeFilter from '../components/CommitteeFilter'
import { ArrowRight, Trophy, Calendar, Archive } from 'lucide-react'
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
    return () => { ignore = true }
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
    return () => { ignore = true }
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
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title="Accomplishments & Milestones"
        description="Celebrating student milestones, competition wins, community outreach initiatives, and organizational achievements."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        {/* Category filters & Year selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-selens-line pb-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((tab) => {
              const isActive = category === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setCategory(tab.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-[4px] transition ${
                    isActive
                      ? 'bg-selens-yellow text-selens-black'
                      : 'bg-selens-ink border border-selens-line text-neutral-300 hover:border-selens-yellow hover:text-selens-yellow'
                  }`}
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
          <div className="p-3.5 bg-selens-ink border border-selens-line rounded-[4px] flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-selens-yellow shrink-0" />
              <span>Viewing accomplishments archive for <strong>A.Y. {selectedYear}</strong></span>
            </span>
            <button
              onClick={() => setSelectedYear(CURRENT_ACADEMIC_YEAR)}
              className="text-selens-yellow hover:underline font-semibold"
            >
              Back to current A.Y. {CURRENT_ACADEMIC_YEAR}
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-24 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
            <div className="h-24 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
            <div className="h-24 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
          </div>
        ) : error ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-red-400">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400 space-y-3">
            <p>
              {selectedYear === CURRENT_ACADEMIC_YEAR
                ? `New updates for A.Y. ${CURRENT_ACADEMIC_YEAR} are coming soon.`
                : `No accomplishments recorded in this category for A.Y. ${selectedYear}.`}
            </p>
            {selectedYear === CURRENT_ACADEMIC_YEAR && pastYear && (
              <div>
                <button
                  onClick={() => setSelectedYear(pastYear)}
                  className="text-xs font-semibold text-selens-yellow hover:text-selens-white underline underline-offset-4"
                >
                  View archive for A.Y. {pastYear}
                </button>
              </div>
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400">
            No accomplishments matching the selected committee filter.
          </div>
        ) : (
          <div className="divide-y divide-selens-line border-y border-selens-line bg-selens-black rounded-[4px]">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="p-5 sm:p-6 hover:bg-selens-ink transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 flex-grow">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-900 rounded-[4px] overflow-hidden shrink-0 hidden sm:block border border-selens-line">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-selens-black text-neutral-600">
                        <Trophy className="w-6 h-6 text-neutral-600" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 font-sans">
                      {item.academic_year && item.academic_year !== CURRENT_ACADEMIC_YEAR && (
                        <span className="text-[11px] font-semibold text-neutral-400 bg-selens-black border border-selens-line px-2 py-0.5 rounded-[2px]">
                          Archive: A.Y. {item.academic_year}
                        </span>
                      )}
                      {item.committee && (
                        <span className="text-[11px] font-semibold text-selens-yellow bg-selens-ink border border-selens-line px-2 py-0.5 rounded-[2px]">
                          {formatCommitteeLabel(item.committee)}
                        </span>
                      )}
                      {item.accomplished_on && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-selens-yellow shrink-0" />
                          <span>
                            {new Date(item.accomplished_on).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                      )}
                      <span className="text-neutral-600">•</span>
                      <span className="text-selens-yellow uppercase tracking-wider text-[11px] font-semibold">
                        {formatCategoryLabel(item.category)}
                      </span>
                    </div>

                    <h2 className="font-serif text-lg font-bold text-selens-white group-hover:text-selens-yellow transition leading-snug">
                      <Link to={`/accomplishments/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-neutral-300 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <Link
                    to={`/accomplishments/${item.slug}`}
                    className="text-xs font-semibold text-selens-yellow group-hover:text-selens-white flex items-center gap-1 transition"
                  >
                    <span>Read details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
