import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { PageHeader } from '../components/SharedUI'
import YearSelector from '../components/YearSelector'
import CommitteeFilter from '../components/CommitteeFilter'
import { ArrowRight, Newspaper, Archive } from 'lucide-react'
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
    return () => { ignore = true }
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
    return () => { ignore = true }
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
    <div className="bg-selens-black text-selens-white min-h-screen">
      <PageHeader
        title={pageTitle}
        description="Latest announcements, academic events, and student activities from the Society of Electrical Engineering Students."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        {/* Filter tabs and Year Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-selens-line pb-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = currentCategory === tab.id
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`px-4 py-2 text-sm font-semibold rounded-[4px] transition ${
                    isActive
                      ? 'bg-selens-yellow text-selens-black'
                      : 'bg-selens-ink border border-selens-line text-neutral-300 hover:border-selens-yellow hover:text-selens-yellow'
                  }`}
                >
                  {tab.label}
                </Link>
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
          items={news}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          selectedCommittee={selectedCommittee}
          onCommitteeChange={setSelectedCommittee}
        />

        {/* Archive notice header if past year */}
        {isArchive && (
          <div className="p-3.5 bg-selens-ink border border-selens-line rounded-[4px] flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-selens-yellow shrink-0" />
              <span>Viewing archive records for <strong>A.Y. {selectedYear}</strong></span>
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
        ) : news.length === 0 ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400 space-y-3">
            <p>
              {selectedYear === CURRENT_ACADEMIC_YEAR
                ? `New updates for A.Y. ${CURRENT_ACADEMIC_YEAR} are coming soon.`
                : `No news items published in this category for A.Y. ${selectedYear}.`}
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
        ) : filteredNews.length === 0 ? (
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-12 text-center text-sm text-neutral-400">
            No news items matching the selected committee filter.
          </div>
        ) : (
          <div className="divide-y divide-selens-line border-y border-selens-line bg-selens-black rounded-[4px]">
            {filteredNews.map((item) => (
              <article
                key={item.id}
                className="p-5 sm:p-6 hover:bg-selens-ink transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 flex-grow">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-900 rounded-[4px] overflow-hidden shrink-0 hidden sm:block border border-selens-line">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-selens-black text-neutral-600">
                        <Newspaper className="w-6 h-6 text-neutral-600" />
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
                      {item.published_at ? (
                        <>
                          <span>
                            {new Date(item.published_at).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-neutral-600">•</span>
                          <span>
                            {new Date(item.published_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </>
                      ) : (
                        <span>Recent announcement</span>
                      )}
                    </div>

                    <h2 className="font-serif text-lg font-bold text-selens-white group-hover:text-selens-yellow transition leading-snug">
                      <Link to={`/news/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h2>

                    <p className="text-sm text-neutral-300 line-clamp-1 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <Link
                    to={`/news/${item.slug}`}
                    className="text-xs font-semibold text-selens-yellow group-hover:text-selens-white flex items-center gap-1 transition"
                  >
                    <span>Read update</span>
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
