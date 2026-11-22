import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { PageHeader } from '../components/SharedUI'
import { ImageFrame, Reveal } from '../components/ui'
import YearSelector from '../components/YearSelector'
import CommitteeFilter from '../components/CommitteeFilter'
import { ArrowUpRight, Archive } from 'lucide-react'
import { CURRENT_ACADEMIC_YEAR, getGroupForCommittee, formatCommitteeLabel } from '../lib/config'

export default function News({ initialCategory } = {}) {
  const [news, setNews] = useState([])
  const [availableYears, setAvailableYears] = useState([CURRENT_ACADEMIC_YEAR])
  const [selectedYear, setSelectedYear] = useState(CURRENT_ACADEMIC_YEAR)
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [selectedCommittee, setSelectedCommittee] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()

  const currentCategory = initialCategory || searchParams.get('category') || 'news_events'

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

  useEffect(() => {
    setSelectedGroup('all')
    setSelectedCommittee('all')
  }, [currentCategory, selectedYear])

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
        title={pageTitle}
        description="Latest announcements, academic events, and student activities from the Society of Electrical Engineering Students."
      />

      <div className="selens-container py-10 sm:py-14 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cdd0d4] pb-5">
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

        <CommitteeFilter
          items={news}
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
                Viewing archive records for <strong className="font-medium">A.Y. {selectedYear}</strong>
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
        ) : news.length === 0 ? (
          <div className="m-surface py-12 text-center m-text-6 text-[#4d5158] space-y-4">
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
                  className="m-btn-2 m-btn-2--mist cursor-pointer"
                >
                  <span className="m-btn-2__label">View archive for A.Y. {pastYear}</span>
                </button>
              </div>
            )}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="m-surface py-12 text-center m-text-6 text-[#4d5158]">
            No news items matching the selected committee filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNews.map((item, idx) => (
              <Reveal
                index={idx}
                key={item.id}
                className="m-surface grid grid-cols-1 md:grid-cols-12 gap-5 items-center transition-shadow hover:shadow-[0_22px_44px_-24px_rgba(18,19,21,0.45)] group"
              >
                {item.thumbnail_url && (
                  <Link
                    to={`/news/${item.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="md:col-span-3 block"
                  >
                    <ImageFrame tone="paper" src={item.thumbnail_url} aspect="aspect-[16/10]" />
                  </Link>
                )}

                <div className={`${item.thumbnail_url ? 'md:col-span-7' : 'md:col-span-10'} min-w-0 space-y-2`}>
                  <div className="flex flex-wrap items-center gap-2 m-text-6 text-[#4d5158]">
                    {item.academic_year && item.academic_year !== CURRENT_ACADEMIC_YEAR && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#e7e8ea] text-[#121315] text-xs font-medium">
                        A.Y. {item.academic_year}
                      </span>
                    )}
                    {item.committee && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
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

                  <h2 className="m-text-5 text-[#121315] group-hover:underline underline-offset-4 line-clamp-2 break-words">
                    <Link to={`/news/${item.slug}`} className="no-underline text-inherit">
                      {item.title}
                    </Link>
                  </h2>

                  {item.excerpt && (
                    <p className="m-text-6 text-[#4d5158] line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 flex md:justify-end shrink-0">
                  <Link
                    to={`/news/${item.slug}`}
                    aria-label={`Read ${item.title}`}
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
