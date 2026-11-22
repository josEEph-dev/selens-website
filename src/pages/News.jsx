import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { PageHeader } from '../components/SharedUI'
import { ImageFrame, Reveal } from '../components/ui'
import YearSelector from '../components/YearSelector'
import CommitteeFilter from '../components/CommitteeFilter'
import { ArrowRight, Archive } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR, getGroupForCommittee, formatCommitteeLabel } from '../lib/config'

// initialCategory prop is passed by the /news/student-activities route alias
export default function News({ initialCategory } = {}) {
  const [news, setNews] = useState([])
  const [availableYears, setAvailableYears] = useState([CURRENT_ACADEMIC_YEAR])
  const [selectedYear, setSelectedYear] = useState(CURRENT_ACADEMIC_YEAR)
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [selectedCommittee, setSelectedCommittee] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()

  // On /news, category defaults to 'news_events'; on /news/student-activities it is 'student_activities'
  const currentCategory = initialCategory || searchParams.get('category') || 'news_events'

  // Discover all distinct academic years in news_posts
  useEffect(() => {
    let ignore = false
    async function loadYears() {
      try {
        const { data, error: yrErr } = await supabase
          .from('news_posts')
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
        console.error('Error fetching academic years:', err)
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
          .from('news_posts')
          .select('id, title, slug, excerpt, body, category, thumbnail_url, published_at, academic_year, committee')
          .order('published_at', { ascending: false })

        if (currentCategory && currentCategory !== 'all') {
          query = query.eq('category', currentCategory)
        }

        if (selectedYear) {
          query = query.eq('academic_year', selectedYear)
        }

        const { data, error: queryError } = await query
        if (queryError) throw queryError
        if (!ignore) setNews(data || [])
      } catch (err) {
        if (!ignore) setError(err.message || 'Failed to load articles.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [currentCategory, selectedYear])

  // Reset group and committee filters when switching category or year
  useEffect(() => {
    setSelectedGroup('all')
    setSelectedCommittee('all')
  }, [currentCategory, selectedYear])

  // Filter news items by group and committee
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const itemGroup = getGroupForCommittee(item.committee)
      if (selectedGroup !== 'all' && itemGroup !== selectedGroup) {
        return false
      }
      if (selectedGroup === 'Legislative' && selectedCommittee !== 'all' && item.committee !== selectedCommittee) {
        return false
      }
      return true
    })
  }, [news, selectedGroup, selectedCommittee])

  const TABS = [
    { id: 'news_events', label: 'News & Events', path: '/news' },
    { id: 'student_activities', label: 'Student Activities', path: '/news/student-activities' },
  ]

  const pageTitle =
    currentCategory === 'student_activities'
      ? 'Student Activities'
      : 'News & Updates'

  const isArchive = selectedYear !== CURRENT_ACADEMIC_YEAR
  const pastYear = availableYears.find((y) => y !== CURRENT_ACADEMIC_YEAR)

  return (
    <div id="main-content" className="selens-paper-page min-h-screen">
      <PageHeader
        eyebrow="Dispatches & Advisories"
        title={pageTitle}
        description="Latest announcements, academic events, and student activities from the Society of Electrical Engineering Students."
      />

      <div className="selens-container py-12 sm:py-16 space-y-8">
        {/* Filter tabs and Year Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-selens-paper-rule pb-5">
          <nav className="selens-chip-row" aria-label="News categories">
            {TABS.map((tab) => {
              const isActive = currentCategory === tab.id
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  aria-current={isActive ? 'page' : undefined}
                  className="selens-chip"
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>

          <YearSelector
            years={availableYears}
            selectedYear={selectedYear}
            onChange={setSelectedYear}
          />
        </div>

        {/* Group and Committee Chips */}
        <CommitteeFilter
          items={news}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          selectedCommittee={selectedCommittee}
          onCommitteeChange={setSelectedCommittee}
        />

        {/* Archive notice header if past year */}
        {isArchive && (
          <div className="p-4 bg-selens-paper-alt border border-selens-paper-rule rounded-[3px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-selens-paper-ink">
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-selens-yellow-ink shrink-0" />
              <span>
                Viewing archive records for <strong>A.Y. {selectedYear}</strong>
              </span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear(CURRENT_ACADEMIC_YEAR)}
              className="min-h-[36px] sm:min-h-0 text-left font-bold underline decoration-selens-yellow decoration-2 underline-offset-4 hover:text-selens-paper-muted cursor-pointer"
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
        ) : news.length === 0 ? (
          <div className="border-y border-selens-paper-rule py-12 text-center text-sm text-selens-paper-muted space-y-3">
            <p>
              {selectedYear === CURRENT_ACADEMIC_YEAR
                ? `New updates for A.Y. ${CURRENT_ACADEMIC_YEAR} are coming soon.`
                : `No news items published in this category for A.Y. ${selectedYear}.`}
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
        ) : filteredNews.length === 0 ? (
          <div className="border-y border-selens-paper-rule py-12 text-center text-sm text-selens-paper-muted">
            No news items matching the selected committee filter.
          </div>
        ) : (
          <div className="divide-y divide-selens-paper-rule border-t-2 border-b border-selens-paper-ink">
            {filteredNews.map((item, idx) => (
              <Reveal
                index={idx}
                key={item.id}
                className="py-6 sm:py-7 px-2 sm:px-3 hover:bg-selens-paper-alt/70 transition-colors grid grid-cols-1 md:grid-cols-12 gap-5 items-start md:items-center group"
              >
                {item.thumbnail_url && (
                  <Link
                    to={`/news/${item.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="md:col-span-3 rounded-[3px] overflow-hidden block"
                  >
                    <ImageFrame tone="paper" src={item.thumbnail_url} aspect="aspect-[16/10]" />
                  </Link>
                )}

                <div className={`${item.thumbnail_url ? 'md:col-span-7' : 'md:col-span-10'} min-w-0 space-y-2`}>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-selens-paper-muted font-mono">
                    {item.academic_year && item.academic_year !== CURRENT_ACADEMIC_YEAR && (
                      <span className="font-mono text-[11px] font-semibold border border-selens-paper-rule px-2 py-0.5 rounded-[2px]">
                        A.Y. {item.academic_year}
                      </span>
                    )}
                    {item.committee && (
                      <span className="font-sans text-[11px] font-bold bg-selens-paper-ink text-selens-yellow px-2 py-0.5 rounded-[2px]">
                        {formatCommitteeLabel(item.committee)}
                      </span>
                    )}
                    {item.published_at ? (
                      <time dateTime={item.published_at}>
                        {new Date(item.published_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    ) : (
                      <span>Recent announcement</span>
                    )}
                  </div>

                  <h2 className="font-serif text-lg sm:text-xl font-bold text-selens-paper-ink group-hover:underline decoration-selens-yellow decoration-2 underline-offset-4 line-clamp-2 break-words leading-snug">
                    <Link to={`/news/${item.slug}`}>{item.title}</Link>
                  </h2>

                  {item.excerpt && (
                    <p className="text-sm sm:text-base text-selens-paper-muted line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 md:text-right shrink-0">
                  <Link to={`/news/${item.slug}`} className="selens-editorial-link text-xs">
                    <span>Read update</span>
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
