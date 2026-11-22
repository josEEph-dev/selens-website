import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../lib/config'
import { SectionHeading, Reveal, TeamLanyardRail } from '../components/ui'
import { ArrowUpRight, ArrowRight, Download } from 'lucide-react'

const INITIATIVES = [
  {
    num: '01',
    title: 'ElectroStock',
    text: 'A hardware lending library providing multimeters, oscilloscope probes, microcontrollers, and circuit modules for laboratory experiments and capstone design projects.',
    to: '/projects#electrostock',
  },
  {
    num: '02',
    title: 'EEngiquest',
    text: 'The annual flagship academic showdown where students across all year levels test their problem-solving skills in circuits, mathematics, power systems, and engineering design.',
    to: '/projects#eengiquest',
  },
  {
    num: '03',
    title: 'TEEchPoints',
    text: 'Our digital recognition system tracking active membership. Earn points by attending technical seminars, volunteering for community drives, and representing the department.',
    to: '/projects#teechpoints',
  },
  {
    num: '04',
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
      {/* 1. OPENING — Hush Notched Dark Field with 3 Docked Fact Cards */}
      <section className="hush-opening" aria-labelledby="op-title">
        <div className="hush-op-grid hush-dark-scope">
          <div className="hush-op-field" aria-hidden="true" />

          {/* Left Docked White Card */}
          <Link
            to="/portal"
            className="hush-op-fact hush-op-fact--1 m-surface no-underline group transition-shadow hover:shadow-[0_22px_44px_-24px_rgba(18,19,21,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="m-text-5 text-[#121315]">Student Portal</h2>
              <ArrowUpRight className="w-4 h-4 text-[#4d5158] group-hover:text-[#121315] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-1" />
            </div>
            <p className="m-text-6 text-[#4d5158]">
              Access your SELENS student account, TEEchPoints tracking, and digital document requests.
            </p>
          </Link>

          {/* Center Dark Pill Fact */}
          <div className="hush-op-fact hush-op-fact--3">
            <p className="m-text-5 text-white">
              92.16%<span className="text-[#FFD100]">.</span> Top 2 National
            </p>
            <p className="m-text-6 text-[#a2a7ae]">
              MSU-GSC Electrical Engineering · April 2025 PRC REELE Performing School.
            </p>
          </div>

          {/* Right Docked White Card */}
          <Link
            to="/topnotchers"
            className="hush-op-fact hush-op-fact--2 m-surface no-underline group transition-shadow hover:shadow-[0_22px_44px_-24px_rgba(18,19,21,0.45)]"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="m-text-5 text-[#121315]">Legion of Topnotchers</h2>
              <ArrowUpRight className="w-4 h-4 text-[#4d5158] group-hover:text-[#121315] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-1" />
            </div>
            <p className="m-text-6 text-[#4d5158]">
              {topnotchersCount > 0
                ? `${topnotchersCount} national PRC board exam topnotchers celebrated across generations.`
                : 'Celebrating MSU-General Santos graduates who placed in the national PRC top 10.'}
            </p>
          </Link>

          {/* Bottom-Left Giant Quiet Display Headline */}
          <h1 id="op-title" className="m-text-2 hush-op-title text-white">
            Society of Electrical Engineering Students<span className="text-[#FFD100]">.</span>
          </h1>

          {/* Bottom-Right Official Intro + Pill CTAs */}
          <div className="hush-op-aside">
            <p className="m-text text-[#a2a7ae]">
              SELENS is the official student organization of Electrical Engineering students at MSU-General Santos. We organize academic events, build practical tools for our members, and celebrate our board exam topnotchers.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link to="/portal" className="m-btn-2 m-btn-2--dark">
                <span className="m-btn-2__label">Student Portal</span>
                <span className="m-btn-2__icon" aria-hidden="true">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
              <a href="#news-updates" className="m-btn-2 m-btn-2--dark">
                <span className="m-btn-2__label">Latest news</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CAMPUS BANNER & PRC REELE PERFORMANCE — Hush Notched Photo Panel Pattern */}
      <section className="selens-section">
        <div className="selens-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left 7 Cols: Notched Photo Panel + Real REELE Chart Below */}
            <div className="lg:col-span-7 space-y-5">
              <div className="hush-bt-media">
                <figure className="hush-bt-panel">
                  <img
                    src="/website-assets/hero-background.jpg"
                    alt="Society of Electrical Engineering Students, Mindanao State University - General Santos"
                    className="w-full h-full object-cover object-center"
                  />
                </figure>
                <div className="hush-bt-note">
                  <span className="m-text-7 text-[#121315]">
                    92.16%<span className="text-[#FFD100]">.</span>
                  </span>
                  <p className="m-text-6 text-[#4d5158]">
                    Top 2 National Performing School (Apr 2025) and 90.32% Top 4 (Apr 2026) in PRC REELE.
                  </p>
                </div>
              </div>

              {/* Clean pure white 20px surface framing the real REELE chart */}
              <div className="m-surface space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="m-text-5 text-[#121315]">PRC REELE Passing Rates</h3>
                  <Link to="/topnotchers" className="m-link m-text-4 text-[#121315]">
                    <span>Legion of Topnotchers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <img
                  src="/website-assets/passing-rates.png"
                  alt="MSU-GSC REELE University Passing Rates: 89.91% (2022), 81.25% (2023), 92.86% (2024), 92.16% Top 2 National Performing School (2025), 90.32% Top 4 Performing School (2026)"
                  loading="lazy"
                  className="w-full h-auto rounded-[12px] block"
                />
              </div>
            </div>

            {/* Right 5 Cols: Quiet Copy + Hairline-Divided Index */}
            <div className="lg:col-span-5 space-y-6 lg:pt-3">
              <div className="space-y-4">
                <h2 className="m-text-3 text-[#121315]">
                  Engineered for excellence at MSU-GSC.
                </h2>
                <p className="m-text text-[#4d5158]">
                  Together, we empower Electrical Engineering students to excel in technical innovation, licensure readiness, and community leadership for A.Y. {CURRENT_ACADEMIC_YEAR}.
                </p>
              </div>

              <ol className="border-t border-[#cdd0d4] divide-y divide-[#cdd0d4]">
                <li className="grid grid-cols-[36px_1fr] gap-x-3 gap-y-1 py-5">
                  <span className="m-text-4 text-[#121315] row-span-2 pt-0.5">01</span>
                  <Link to="/about" className="m-text-5 text-[#121315] no-underline hover:underline underline-offset-4">
                    About SELENS &amp; Org Charts
                  </Link>
                  <p className="m-text-6 text-[#4d5158]">
                    Our founding constitutional mandate, core objectives, and official student &amp; faculty structure.
                  </p>
                </li>
                <li className="grid grid-cols-[36px_1fr] gap-x-3 gap-y-1 py-5">
                  <span className="m-text-4 text-[#121315] row-span-2 pt-0.5">02</span>
                  <Link to="/awards" className="m-text-5 text-[#121315] no-underline hover:underline underline-offset-4">
                    Accreditations &amp; Awards
                  </Link>
                  <p className="m-text-6 text-[#4d5158]">
                    Institutional rankings, national recognitions, and chapter citations across academic years.
                  </p>
                </li>
                <li className="grid grid-cols-[36px_1fr] gap-x-3 gap-y-1 py-5">
                  <span className="m-text-4 text-[#121315] row-span-2 pt-0.5">03</span>
                  <a
                    href="/website-assets/constitution-and-by-laws-of-selens.pdf"
                    download
                    className="m-text-5 text-[#121315] no-underline hover:underline underline-offset-4 inline-flex items-center gap-2"
                  >
                    <span>Constitution &amp; By-Laws</span>
                    <Download className="w-4 h-4 text-[#4d5158]" />
                  </a>
                  <p className="m-text-6 text-[#4d5158]">
                    Download the official governing PDF outlining policies, officer duties, and assembly operations.
                  </p>
                </li>
              </ol>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link to="/about" className="m-btn">
                  <span className="m-btn__label">About the organization</span>
                </Link>
                <Link to="/faq" className="m-btn-2">
                  <span className="m-btn-2__label">Read FAQ</span>
                  <span className="m-btn-2__icon" aria-hidden="true">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEWS & ACCOMPLISHMENTS — Hush Twin White + Dark 28px Split Contrast Cards */}
      <section id="news-updates" className="selens-section pt-0 scroll-mt-24">
        <div className="selens-container space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <h2 className="m-text-3 text-[#121315] lg:col-span-7">
              Dispatches and chapter milestones.
            </h2>
            <p className="m-text text-[#4d5158] lg:col-span-5">
              Official announcements, event advisories, and student accomplishments for A.Y. {CURRENT_ACADEMIC_YEAR}.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
            {/* LEFT PURE WHITE PANEL: News & Updates */}
            <article className="m-panel-light p-6 sm:p-10 grid grid-rows-[auto_1fr_auto] gap-6">
              <div className="space-y-1.5">
                <h3 className="m-text-3 text-[#121315]">News &amp; updates</h3>
                <p className="m-text-6 text-[#4d5158]">
                  Announcements and event advisories from SELENS committees.
                </p>
              </div>

              <div>
                {loadingNews ? (
                  <div className="space-y-3 py-4">
                    <div className="h-16 bg-[#e7e8ea] rounded-[14px] animate-pulse" />
                    <div className="h-16 bg-[#e7e8ea] rounded-[14px] animate-pulse" />
                  </div>
                ) : newsError ? (
                  <p className="m-text-6 text-red-700 py-4">{newsError}</p>
                ) : news.length > 0 ? (
                  <ul className="hush-ow-list">
                    {news.map((item) => (
                      <li key={item.id}>
                        <span className="hush-ow-dot" aria-hidden="true" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 m-text-6 text-[#4d5158]">
                            {item.published_at ? (
                              <time dateTime={item.published_at}>
                                {new Date(item.published_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </time>
                            ) : (
                              <span>Recent update</span>
                            )}
                            {item.committee && (
                              <span className="px-2.5 py-0.5 rounded-full bg-[#e7e8ea] text-[#121315] text-xs font-medium">
                                {formatCommitteeLabel(item.committee)}
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/news/${item.slug}`}
                            className="m-text-5 text-[#121315] no-underline hover:underline underline-offset-4 block break-words"
                          >
                            {item.title}
                          </Link>
                          {item.excerpt && (
                            <p className="m-text-6 text-[#4d5158] line-clamp-2">
                              {item.excerpt}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="m-text-6 text-[#4d5158] border-t border-[#cdd0d4] py-6">
                    New updates for A.Y. {CURRENT_ACADEMIC_YEAR} are coming soon.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Link to="/news" className="m-btn">
                  <span className="m-btn__label">All news &amp; events</span>
                </Link>
              </div>
            </article>

            {/* RIGHT DEEP INK PANEL: Latest Accomplishments */}
            <article className="m-panel-dark hush-dark-scope p-6 sm:p-10 grid grid-rows-[auto_1fr_auto] gap-6">
              <div className="space-y-1.5">
                <h3 className="m-text-3 text-white">Accomplishments</h3>
                <p className="m-text-6 text-[#a2a7ae]">
                  Student wins, competitions, and community outreach records.
                </p>
              </div>

              <div>
                {loadingAccomplishments ? (
                  <div className="space-y-3 py-4">
                    <div className="h-16 bg-white/10 rounded-[14px] animate-pulse" />
                    <div className="h-16 bg-white/10 rounded-[14px] animate-pulse" />
                  </div>
                ) : accomplishmentsError ? (
                  <p className="m-text-6 text-red-400 py-4">{accomplishmentsError}</p>
                ) : accomplishments.length > 0 ? (
                  <ul className="hush-ow-list hush-ow-list--dark">
                    {accomplishments.map((item) => (
                      <li key={item.id}>
                        <span className="hush-ow-dot" aria-hidden="true" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 m-text-6 text-[#a2a7ae]">
                            {item.category && (
                              <span className="capitalize text-white/90 font-medium">
                                {item.category.replace('_', ' ')}
                              </span>
                            )}
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
                          <Link
                            to={`/accomplishments/${item.slug}`}
                            className="m-text-5 text-white no-underline hover:text-[#FFD100] transition-colors block break-words"
                          >
                            {item.title}
                          </Link>
                          {item.summary && (
                            <p className="m-text-6 text-[#a2a7ae] line-clamp-2">
                              {item.summary}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="m-text-6 text-[#a2a7ae] border-t border-white/15 py-6">
                    New accomplishments for A.Y. {CURRENT_ACADEMIC_YEAR} will be posted here soon.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Link to="/accomplishments" className="m-btn-2 m-btn-2--dark">
                  <span className="m-btn-2__label">View all accomplishments</span>
                  <span className="m-btn-2__icon" aria-hidden="true">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            </article>
          </div>

          {/* Past Academic Year Highlights Strip (when records exist) */}
          {pastYearHighlights && pastYearHighlights.items?.length > 0 && (
            <div className="m-surface space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3 className="m-text-5 text-[#121315]">
                  From A.Y. {pastYearHighlights.year}
                </h3>
                <Link to="/news" className="m-link m-text-4 text-[#121315]">
                  <span>See archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <ul className="divide-y divide-[#cdd0d4] border-t border-[#cdd0d4]">
                {pastYearHighlights.items.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.link}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 no-underline group"
                    >
                      <span className="m-text font-medium text-[#121315] group-hover:underline underline-offset-4">
                        {item.title}
                      </span>
                      <span className="m-text-6 text-[#4d5158] shrink-0">
                        {item.type}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 4. FLAGSHIP STUDENT PROGRAMS — 4 Pure White 20px Surfaces on Mist */}
      <section className="selens-section pt-0">
        <div className="selens-container space-y-10">
          <SectionHeading
            tone="paper"
            title="Projects & initiatives."
            description={
              programsCount > 0
                ? `${programsCount} active student-driven programs supporting laboratory exploration, academics, and outreach for A.Y. ${CURRENT_ACADEMIC_YEAR}.`
                : 'Student-driven programs supporting laboratory exploration, academics, and community outreach.'
            }
            action={
              <Link to="/projects" className="m-btn-2">
                <span className="m-btn-2__label">Explore all programs</span>
                <span className="m-btn-2__icon" aria-hidden="true">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {INITIATIVES.map((prog, idx) => (
              <Reveal
                key={prog.title}
                index={idx}
                className="m-surface flex flex-col justify-between gap-6 transition-shadow hover:shadow-[0_22px_44px_-24px_rgba(18,19,21,0.45)]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#e7e8ea] m-text-4 text-[#121315]">
                      {prog.num}
                    </span>
                    <Link
                      to={prog.to}
                      aria-label={`Learn more about ${prog.title}`}
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
                  <h3 className="m-text-5 text-[#121315] pt-1">{prog.title}</h3>
                  <p className="m-text-6 text-[#4d5158] max-w-prose">
                    {prog.text}
                  </p>
                </div>

                <div>
                  <Link to={prog.to} className="m-link m-text-4 text-[#121315]">
                    Learn more
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EXECUTIVE BOARD — Interactive TeamLanyardRail Framed as Rounded 28px Dark Stage */}
      <section className="selens-section pt-0">
        <div className="selens-container space-y-8">
          <SectionHeading
            tone="paper"
            title="Executive Board."
            description={`Officers serving the Society of Electrical Engineering Students for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
            action={
              <Link to="/people" className="m-btn-2">
                <span className="m-btn-2__label">Full officer &amp; faculty directory</span>
                <span className="m-btn-2__icon" aria-hidden="true">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            }
          />

          {loadingOfficers ? (
            <div className="h-[340px] bg-[#d9dce0] rounded-[28px] animate-pulse" />
          ) : officersError ? (
            <div className="m-surface text-center m-text-6 text-red-700">
              {officersError}
            </div>
          ) : officerLanyardItems.length > 0 ? (
            <TeamLanyardRail
              items={officerLanyardItems}
              caption="Hover, drag, pull down, or click a badge to flip"
            />
          ) : (
            <div className="m-surface text-center py-10 m-text-6 text-[#4d5158]">
              Officer directory will be updated shortly.
            </div>
          )}
        </div>
      </section>

      {/* 6. VISIT THE DEE OFFICE — Hush Notched Map Panel + Docked White Info Card */}
      <section className="selens-section pt-0 pb-4">
        <div className="selens-container space-y-7">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="m-text-3 text-[#121315]">
              Visit the DEE Office.
            </h2>
            <div className="grid gap-0.5 m-text-6 text-[#4d5158] sm:text-right">
              <strong className="font-medium text-[#121315]">
                College of Engineering Building, MSU-GSC
              </strong>
              <span>Fatima, General Santos City · Mon–Fri, 8:00 AM–5:00 PM</span>
            </div>
          </div>

          <div className="hush-cn-wrap">
            <div className="hush-cn-panel">
              <iframe
                title="Mindanao State University - General Santos Fatima Campus Map"
                src="https://maps.google.com/maps?q=Mindanao%20State%20University%20General%20Santos%20Fatima&t=&z=16&ie=UTF8&iwloc=&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full min-h-[320px] lg:min-h-[520px] border-0 block"
              />
            </div>

            <aside className="hush-cn-card m-surface m-shadow space-y-5">
              <div className="space-y-1">
                <h3 className="m-text-5 text-[#121315]">Headquarters &amp; hours</h3>
                <p className="m-text-6 text-[#4d5158]">
                  Drop by for student consultations, laboratory tool borrowing, or membership inquiries.
                </p>
              </div>

              <dl className="divide-y divide-[#cdd0d4] border-t border-b border-[#cdd0d4] m-text-6">
                <div className="py-3 grid gap-0.5">
                  <dt className="font-medium text-[#121315]">Location</dt>
                  <dd className="text-[#4d5158]">
                    DEE Office, College of Engineering Building, MSU-General Santos, Fatima, General Santos City, 9500
                  </dd>
                </div>
                <div className="py-3 grid gap-0.5">
                  <dt className="font-medium text-[#121315]">Consultation hours</dt>
                  <dd className="text-[#4d5158]">
                    Monday to Friday: 8:00 AM – 5:00 PM (regular academic semester)
                  </dd>
                </div>
                <div className="py-3 grid gap-0.5">
                  <dt className="font-medium text-[#121315]">Official email</dt>
                  <dd>
                    <a
                      href="mailto:iieeasteeg@msugensan.edu.ph"
                      className="m-link text-[#121315] font-medium"
                    >
                      iieeasteeg@msugensan.edu.ph
                    </a>
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/portal" className="m-btn">
                  <span className="m-btn__label">Open Student Portal</span>
                </Link>
                <a
                  href="https://msugensan.edu.ph"
                  target="_blank"
                  rel="noreferrer"
                  className="m-link m-text-4 text-[#121315]"
                >
                  msugensan.edu.ph
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
