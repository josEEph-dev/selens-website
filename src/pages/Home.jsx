import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../lib/config'
import { SectionHeading, Reveal, TeamLanyardRail } from '../components/ui'
import {
  ArrowRight,
  MapPin,
  Clock,
  Mail,
  ExternalLink,
  Download,
} from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Student Portal', to: '/portal' },
  { label: 'TEEchPoints Tracking', to: '/portal/teechpoints' },
  { label: 'Digital Document Requests', to: '/portal/documents' },
  { label: 'People & Leadership Directory', to: '/people' },
  { label: 'Accreditations & Awards', to: '/awards' },
  { label: 'Frequently Asked Questions', to: '/faq' },
]

const INITIATIVES = [
  {
    title: 'ElectroStock',
    text: 'A hardware lending library providing multimeters, oscilloscope probes, microcontrollers, and circuit modules for laboratory experiments and capstone design projects.',
    to: '/projects#electrostock',
  },
  {
    title: 'EEngiquest',
    text: 'The annual flagship academic showdown where students across all year levels test their problem-solving skills in circuits, mathematics, power systems, and engineering design.',
    to: '/projects#eengiquest',
  },
  {
    title: 'TEEchPoints',
    text: 'Our digital recognition system tracking active membership. Earn points by attending technical seminars, volunteering for community drives, and representing the department.',
    to: '/projects#teechpoints',
  },
  {
    title: 'Community outreach',
    text: 'Extending engineering beyond the campus through rural electrification assistance, energy conservation campaigns, and STEM workshops for local high schools.',
    to: '/projects#outreach',
  },
]

export default function Home() {
  const [news, setNews] = useState([])
  const [accomplishments, setAccomplishments] = useState([])
  const [officers, setOfficers] = useState([])
  const [topnotchersCount, setTopnotchersCount] = useState(0)
  const [programsCount, setProgramsCount] = useState(0)
  const [pastYearHighlights, setPastYearHighlights] = useState(null)
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingAccomplishments, setLoadingAccomplishments] = useState(true)
  const [loadingOfficers, setLoadingOfficers] = useState(true)
  const [newsError, setNewsError] = useState(null)
  const [accomplishmentsError, setAccomplishmentsError] = useState(null)
  const [officersError, setOfficersError] = useState(null)

  useEffect(() => {
    let ignore = false

    async function loadCounts() {
      try {
        const [{ count: tCount }, { count: pCount }] = await Promise.all([
          supabase.from('topnotchers').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }).eq('academic_year', CURRENT_ACADEMIC_YEAR),
        ])
        if (!ignore) {
          setTopnotchersCount(tCount || 0)
          setProgramsCount(pCount || 0)
        }
      } catch (err) {
        console.error('Error fetching Supabase counts:', err)
      }
    }

    async function loadNews() {
      try {
        const { data, error } = await supabase
          .from('news_posts')
          .select('id, title, slug, excerpt, thumbnail_url, published_at, committee')
          .eq('academic_year', CURRENT_ACADEMIC_YEAR)
          .order('published_at', { ascending: false })
          .limit(4)

        if (error) throw error
        if (!ignore) setNews(data || [])
      } catch (err) {
        if (!ignore) setNewsError(err.message || 'Failed to load news updates.')
      } finally {
        if (!ignore) setLoadingNews(false)
      }
    }

    async function loadAccomplishments() {
      try {
        const { data, error } = await supabase
          .from('accomplishments')
          .select('id, title, slug, summary, category, accomplished_on, image_url, committee')
          .eq('academic_year', CURRENT_ACADEMIC_YEAR)
          .order('accomplished_on', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) throw error
        if (!ignore) setAccomplishments(data || [])
      } catch (err) {
        if (!ignore) setAccomplishmentsError(err.message || 'Failed to load accomplishments.')
      } finally {
        if (!ignore) setLoadingAccomplishments(false)
      }
    }

    async function loadOfficers() {
      try {
        const { data, error } = await supabase
          .from('people')
          .select('id, full_name, position, photo_url, display_order')
          .eq('category', 'executive_board')
          .order('display_order', { ascending: true })
          .limit(6)

        if (error) throw error
        if (!ignore) setOfficers(data || [])
      } catch (err) {
        if (!ignore) setOfficersError(err.message || 'Failed to load officers.')
      } finally {
        if (!ignore) setLoadingOfficers(false)
      }
    }

    async function loadPastYearHighlights() {
      try {
        const [{ data: newsYears }, { data: awardYears }, { data: projYears }, { data: accYears }] = await Promise.all([
          supabase.from('news_posts').select('academic_year').neq('academic_year', CURRENT_ACADEMIC_YEAR),
          supabase.from('awards').select('academic_year').neq('academic_year', CURRENT_ACADEMIC_YEAR),
          supabase.from('projects').select('academic_year').neq('academic_year', CURRENT_ACADEMIC_YEAR),
          supabase.from('accomplishments').select('academic_year').neq('academic_year', CURRENT_ACADEMIC_YEAR),
        ])

        const allPastYears = [
          ...(newsYears || []).map((r) => r.academic_year),
          ...(awardYears || []).map((r) => r.academic_year),
          ...(projYears || []).map((r) => r.academic_year),
          ...(accYears || []).map((r) => r.academic_year),
        ].filter(Boolean)

        if (allPastYears.length === 0) return

        const sortedPast = Array.from(new Set(allPastYears)).sort().reverse()
        const targetPastYear = sortedPast[0]
        if (!targetPastYear) return

        const [{ data: pNews }, { data: pAwards }, { data: pProjects }, { data: pAcc }] = await Promise.all([
          supabase.from('news_posts').select('id, title, slug, published_at, created_at').eq('academic_year', targetPastYear).limit(3),
          supabase.from('awards').select('id, title, date_awarded, created_at').eq('academic_year', targetPastYear).limit(3),
          supabase.from('projects').select('id, name, created_at').eq('academic_year', targetPastYear).limit(3),
          supabase.from('accomplishments').select('id, title, slug, accomplished_on, created_at').eq('academic_year', targetPastYear).limit(3),
        ])

        const combined = [
          ...(pNews || []).map((item) => ({
            id: `news-${item.id}`,
            title: item.title,
            type: 'News & Events',
            link: `/news/${item.slug}`,
            date: item.published_at || item.created_at,
          })),
          ...(pAcc || []).map((item) => ({
            id: `acc-${item.id}`,
            title: item.title,
            type: 'Accomplishment',
            link: item.slug ? `/accomplishments/${item.slug}` : '/accomplishments',
            date: item.accomplished_on || item.created_at,
          })),
          ...(pAwards || []).map((item) => ({
            id: `award-${item.id}`,
            title: item.title,
            type: 'Award & Citation',
            link: '/awards',
            date: item.date_awarded || item.created_at,
          })),
          ...(pProjects || []).map((item) => ({
            id: `proj-${item.id}`,
            title: item.name,
            type: 'Project',
            link: '/projects',
            date: item.created_at,
          })),
        ]

        combined.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
        const top3 = combined.slice(0, 3)

        if (!ignore && top3.length > 0) {
          setPastYearHighlights({ year: targetPastYear, items: top3 })
        }
      } catch (err) {
        console.error('Error loading past year highlights:', err)
      }
    }

    loadCounts()
    loadNews()
    loadAccomplishments()
    loadOfficers()
    loadPastYearHighlights()

    return () => {
      ignore = true
    }
  }, [])

  const officerLanyardItems = useMemo(
    () =>
      officers.map((officer, index) => ({
        id: String(officer.id),
        name: officer.full_name,
        role: officer.position,
        team: `A.Y. ${CURRENT_ACADEMIC_YEAR}`,
        image: officer.photo_url || '',
        tags: ['Executive Board', `A.Y. ${CURRENT_ACADEMIC_YEAR}`],
        links: [{ label: 'Full directory', href: '/people' }],
        tone: (index % 5) + 1,
      })),
    [officers]
  )

  return (
    <div id="main-content" className="selens-paper-page">
      {/* 1. REAL PHOTOGRAPHIC CAMPUS BANNER + INSTITUTIONAL WELCOME BAR */}
      <section className="bg-neutral-950 border-b border-neutral-200">
        <div className="relative w-full overflow-hidden bg-neutral-950">
          <img
            src="/website-assets/hero-background.jpg"
            alt="Society of Electrical Engineering Students, Mindanao State University - General Santos"
            className="w-full max-h-[460px] object-cover object-center block mx-auto"
          />
        </div>

        <div className="bg-white border-t border-neutral-200">
          <div className="selens-container py-8 sm:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-2.5">
              <h1 className="font-serif selens-fluid-hero font-bold text-neutral-950">
                Society of Electrical Engineering Students
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans">
                SELENS is the official student organization of Electrical Engineering students at MSU-General Santos. We organize academic events, build practical tools for our members, and celebrate our board exam topnotchers. Together, we empower students to excel in technical innovation and community leadership.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/portal" className="selens-btn-ink px-5">
                Student Portal
              </Link>
              <a href="#news-updates" className="selens-btn-paper-outline px-5">
                See latest news
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UNIVERSITY BULLETIN & SIDEBAR LAYOUT (Classic PH University Portal Architecture) */}
      <section className="selens-section bg-white">
        <div className="selens-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* LEFT 8 COLUMNS: Primary Institutional Stream */}
            <div className="lg:col-span-8 space-y-14">
              {/* News & Announcements */}
              <div id="news-updates" className="space-y-5 scroll-mt-28">
                <SectionHeading
                  tone="paper"
                  title="News & Updates"
                  description={`Announcements and event advisories for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
                  action={
                    <Link to="/news" className="selens-editorial-link">
                      <span>All news</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  }
                />

                {loadingNews ? (
                  <div className="space-y-3">
                    <div className="h-16 bg-neutral-100 rounded-[4px] animate-pulse" />
                    <div className="h-16 bg-neutral-100 rounded-[4px] animate-pulse" />
                  </div>
                ) : newsError ? (
                  <p className="text-sm text-red-700 py-4">{newsError}</p>
                ) : news.length > 0 ? (
                  <div className="divide-y divide-neutral-200">
                    {news.map((item, idx) => (
                      <Reveal
                        key={item.id}
                        index={idx}
                        className="py-5 first:pt-1 flex flex-col sm:flex-row gap-4 items-start group"
                      >
                        {item.thumbnail_url && (
                          <Link
                            to={`/news/${item.slug}`}
                            tabIndex={-1}
                            aria-hidden="true"
                            className="w-full sm:w-36 aspect-[16/10] shrink-0 rounded-[4px] overflow-hidden border border-neutral-200 bg-neutral-100"
                          >
                            <img
                              src={item.thumbnail_url}
                              alt=""
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </Link>
                        )}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
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
                            {item.committee && (
                              <span className="font-semibold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-[3px]">
                                {formatCommitteeLabel(item.committee)}
                              </span>
                            )}
                          </div>
                          <h3 className="font-serif text-lg font-bold text-neutral-950 group-hover:underline decoration-selens-yellow decoration-2 underline-offset-4 leading-snug">
                            <Link to={`/news/${item.slug}`}>{item.title}</Link>
                          </h3>
                          {item.excerpt && (
                            <p className="text-sm text-neutral-600 line-clamp-2 leading-relaxed">
                              {item.excerpt}
                            </p>
                          )}
                        </div>
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600 py-4 border-b border-neutral-200">
                    New updates for A.Y. {CURRENT_ACADEMIC_YEAR} are coming soon.
                  </p>
                )}
              </div>

              {/* Latest Accomplishments */}
              <div className="space-y-5">
                <SectionHeading
                  tone="paper"
                  title="Latest Accomplishments"
                  description={`Student achievements and chapter milestones for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
                  action={
                    <Link to="/accomplishments" className="selens-editorial-link">
                      <span>View all</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  }
                />

                {loadingAccomplishments ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="h-28 bg-neutral-100 rounded-[4px] animate-pulse" />
                    <div className="h-28 bg-neutral-100 rounded-[4px] animate-pulse" />
                  </div>
                ) : accomplishmentsError ? (
                  <p className="text-sm text-red-700 py-4">{accomplishmentsError}</p>
                ) : accomplishments.length > 0 ? (
                  <div className="divide-y divide-neutral-200">
                    {accomplishments.map((item, idx) => (
                      <Reveal key={item.id} index={idx} className="py-4 first:pt-1">
                        <Link
                          to={`/accomplishments/${item.slug}`}
                          className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 group"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                              <span className="font-semibold text-neutral-900 uppercase tracking-wide">
                                {item.category?.replace('_', ' ')}
                              </span>
                              {item.accomplished_on && (
                                <span>
                                  ·{' '}
                                  {new Date(item.accomplished_on).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif text-base sm:text-lg font-bold text-neutral-950 group-hover:underline decoration-selens-yellow decoration-2 underline-offset-4">
                              {item.title}
                            </h3>
                            {item.summary && (
                              <p className="text-sm text-neutral-600 line-clamp-2">
                                {item.summary}
                              </p>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-neutral-800 shrink-0 inline-flex items-center gap-1 min-h-[28px]">
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </Link>
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600 py-4 border-b border-neutral-200">
                    New accomplishments for A.Y. {CURRENT_ACADEMIC_YEAR} will be posted here soon.
                  </p>
                )}
              </div>

              {/* Flagship Student Programs */}
              <div className="space-y-5">
                <SectionHeading
                  tone="paper"
                  title="Projects & Initiatives"
                  description={
                    programsCount > 0
                      ? `${programsCount} active student-driven programs for A.Y. ${CURRENT_ACADEMIC_YEAR}.`
                      : `Student-driven programs supporting laboratory exploration, academics, and outreach.`
                  }
                  action={
                    <Link to="/projects" className="selens-editorial-link">
                      <span>Explore all programs</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {INITIATIVES.map((prog, idx) => (
                    <Reveal
                      key={prog.title}
                      index={idx}
                      className="border border-neutral-200 rounded-[4px] bg-neutral-50/70 p-5 flex flex-col justify-between gap-3 hover:border-neutral-400 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <h3 className="font-serif text-base font-bold text-neutral-950">
                          {prog.title}
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                          {prog.text}
                        </p>
                      </div>
                      <div>
                        <Link to={prog.to} className="selens-editorial-link text-xs">
                          <span>Learn more</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* Past Academic Year Archive (when records exist) */}
              {pastYearHighlights && pastYearHighlights.items?.length > 0 && (
                <div className="space-y-4 pt-2">
                  <SectionHeading
                    tone="paper"
                    title={`From A.Y. ${pastYearHighlights.year}`}
                    action={
                      <Link to="/news" className="selens-editorial-link text-xs">
                        <span>See archive</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    }
                  />
                  <ul className="divide-y divide-neutral-200 border-b border-neutral-200">
                    {pastYearHighlights.items.map((item) => (
                      <li key={item.id}>
                        <Link
                          to={item.link}
                          className="py-3 flex items-baseline justify-between gap-4 hover:bg-neutral-50 transition-colors group"
                        >
                          <span className="font-serif text-sm sm:text-base font-bold text-neutral-900 group-hover:underline decoration-selens-yellow decoration-2 underline-offset-4">
                            {item.title}
                          </span>
                          <span className="text-xs text-neutral-500 shrink-0">
                            {item.type}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* RIGHT 4 COLUMNS: Real MSU-GSC Institutional Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* REAL REELE Board Exam Passing Rates Graphic */}
              <div className="border border-neutral-200 rounded-[4px] bg-white overflow-hidden">
                <div className="bg-neutral-950 text-white px-4 py-3 flex items-center justify-between gap-2">
                  <h2 className="font-serif text-sm font-bold">
                    PRC REELE Passing Rates
                  </h2>
                  <span className="text-[11px] font-bold bg-selens-yellow text-neutral-950 px-2 py-0.5 rounded-[2px]">
                    MSU-GSC
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 border-b border-neutral-200">
                  <img
                    src="/website-assets/passing-rates.png"
                    alt="MSU-GSC REELE University Passing Rates: 89.91% (2022), 81.25% (2023), 92.86% (2024), 92.16% Top 2 National Performing School (2025), 90.32% Top 4 Performing School (2026)"
                    loading="lazy"
                    className="w-full h-auto rounded-[2px] border border-neutral-200"
                  />
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Top 2 National Performing School in April 2025 (92.16%) and Top 4 Performing School in April 2026 (90.32%).
                    {topnotchersCount > 0 ? ` ${topnotchersCount} national board topnotchers on record.` : ''}
                  </p>
                  <Link to="/topnotchers" className="selens-editorial-link text-xs">
                    <span>View Legion of Topnotchers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Quick Student Services & Links */}
              <div className="border border-neutral-200 rounded-[4px] bg-neutral-50 p-5 space-y-3">
                <h2 className="font-serif text-base font-bold text-neutral-950 border-b border-neutral-200 pb-2">
                  Quick Links
                </h2>
                <ul className="divide-y divide-neutral-200 text-sm">
                  {QUICK_LINKS.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="min-h-[38px] py-2 flex items-center justify-between text-neutral-700 hover:text-neutral-950 font-medium transition-colors group"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-950" />
                      </Link>
                    </li>
                  ))}
                  <li>
                    <a
                      href="/website-assets/constitution-and-by-laws-of-selens.pdf"
                      download
                      className="min-h-[38px] py-2 flex items-center justify-between text-neutral-700 hover:text-neutral-950 font-medium transition-colors"
                    >
                      <span>Constitution &amp; By-Laws (PDF)</span>
                      <Download className="w-3.5 h-3.5 text-neutral-500" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Department Office Quick Info */}
              <div className="border border-neutral-200 rounded-[4px] bg-white p-5 space-y-2.5 text-sm">
                <h2 className="font-serif text-base font-bold text-neutral-950">
                  About SELENS
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Empowering Electrical Engineering students at MSU-General Santos through academic support, technical services, and student leadership for A.Y. {CURRENT_ACADEMIC_YEAR}.
                </p>
                <Link to="/about" className="selens-editorial-link text-xs">
                  <span>About the organization &amp; org chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 3. MEET YOUR OFFICERS — Interactive TeamLanyardRail Showcase */}
      <section className="w-full bg-neutral-100 border-y border-neutral-200 selens-section">
        <div className="selens-container space-y-6">
          <SectionHeading
            tone="paper"
            title="Executive Board"
            description={`Officers serving the Society of Electrical Engineering Students for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
            action={
              <Link to="/people" className="selens-editorial-link">
                <span>Full officer &amp; faculty directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          {loadingOfficers ? (
            <div className="h-[340px] bg-neutral-200 rounded-[4px] animate-pulse" />
          ) : officersError ? (
            <div className="p-6 text-center text-sm text-red-700 bg-white border border-red-200 rounded-[4px]">
              {officersError}
            </div>
          ) : officerLanyardItems.length > 0 ? (
            <TeamLanyardRail
              items={officerLanyardItems}
              caption="Hover, drag, pull down, or click a badge to flip"
            />
          ) : (
            <div className="text-center py-8 text-neutral-600 bg-white border border-neutral-200 rounded-[4px]">
              Officer directory will be updated shortly.
            </div>
          )}
        </div>
      </section>

      {/* 4. CAMPUS HEADQUARTERS & REAL INTERACTIVE GOOGLE MAP */}
      <section className="bg-white selens-section">
        <div className="selens-container space-y-8">
          <SectionHeading
            tone="paper"
            title="Visit the DEE Office"
            description="College of Engineering Building, Mindanao State University – General Santos, Fatima Campus."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 divide-y divide-neutral-200 border-t border-b border-neutral-200">
              <div className="py-4 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-0.5">
                  <h3 className="font-serif font-bold text-sm text-neutral-950">
                    Headquarters
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    DEE Office, College of Engineering Building<br />
                    Mindanao State University - General Santos<br />
                    Fatima, General Santos City, 9500 Philippines
                  </p>
                </div>
              </div>

              <div className="py-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-0.5">
                  <h3 className="font-serif font-bold text-sm text-neutral-950">
                    Office &amp; Consultation Hours
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Monday to Friday: 8:00 AM – 5:00 PM<br />
                    During regular academic semester periods.
                  </p>
                </div>
              </div>

              <div className="py-4 flex items-start gap-3">
                <Mail className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-0.5">
                  <h3 className="font-serif font-bold text-sm text-neutral-950">
                    Official Email
                  </h3>
                  <a
                    href="mailto:iieeasteeg@msugensan.edu.ph"
                    className="selens-editorial-link text-sm"
                  >
                    iieeasteeg@msugensan.edu.ph
                  </a>
                </div>
              </div>

              <div className="py-4">
                <a
                  href="https://msugensan.edu.ph"
                  target="_blank"
                  rel="noreferrer"
                  className="selens-editorial-link text-xs"
                >
                  <span>Visit MSU-General Santos Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 border border-neutral-200 rounded-[4px] overflow-hidden bg-neutral-100">
              <iframe
                title="Mindanao State University - General Santos Fatima Campus Map"
                src="https://maps.google.com/maps?q=Mindanao%20State%20University%20General%20Santos%20Fatima&t=&z=16&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[320px] sm:h-[360px] border-0 block"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
