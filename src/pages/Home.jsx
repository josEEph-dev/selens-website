import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../lib/config'
import { SectionBadge, SectionHeading, Waveform, Reveal, TeamLanyardRail } from '../components/ui'
import {
  ArrowRight,
  MapPin,
  Clock,
  Mail,
  ExternalLink,
} from 'lucide-react'

const AFFILIATION_LOGOS = [
  {
    src: '/website-assets/university-seal.png',
    alt: 'Mindanao State University - General Santos Seal',
    label: 'Mindanao State University - General Santos',
  },
  {
    src: '/website-assets/coe-logo.png',
    alt: 'College of Engineering Logo',
    label: 'College of Engineering',
  },
  {
    src: '/website-assets/selens-logo.png',
    alt: 'Society of Electrical Engineering Students Logo',
    label: 'Society of Electrical Engineering Students',
  },
]

function HeroWaveformBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Subtle radial glow allowed in the hero */}
      <div className="absolute inset-0 selens-hero-glow" />

      <Waveform intensity={1} />

      {/* Bottom fade to solid black */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)',
        }}
      />
    </div>
  )
}

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
      {/* 1. HERO: Matte Black Academic-Editorial Showcase Band */}
      <section className="relative overflow-hidden border-b-2 border-selens-yellow bg-selens-black text-selens-white">
        <HeroWaveformBackground />

        <div className="relative z-10 selens-container pt-14 pb-14 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24 space-y-10 sm:space-y-12">
          {/* Top Eyebrow & Academic Issue Line */}
          <div
            className="flex flex-wrap items-center justify-between gap-4 selens-hero-item"
            style={{ animationDelay: '0ms' }}
          >
            <SectionBadge>WELCOME TO SELENS</SectionBadge>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-neutral-400">
              MSU-General Santos · College of Engineering · A.Y. {CURRENT_ACADEMIC_YEAR}
            </span>
          </div>

          {/* Authoritative Editorial Headline */}
          <h1
            className="font-serif selens-fluid-hero font-bold text-selens-white max-w-4xl selens-hero-item"
            style={{ animationDelay: '70ms' }}
          >
            Society of Electrical Engineering Students
          </h1>

          {/* 12-Col Editorial Base Split: Copy + CTAs on left, Official Affiliations on right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-8 border-t border-selens-line items-start">
            <div
              className="lg:col-span-7 space-y-6 selens-hero-item"
              style={{ animationDelay: '140ms' }}
            >
              <p className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed font-sans">
                SELENS is the official student organization of Electrical Engineering students at MSU-General Santos. We organize academic events, build practical tools for our members, and celebrate our board exam topnotchers. Together, we empower students to excel in technical innovation and community leadership.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link to="/portal" className="selens-btn-primary text-base px-6 py-3">
                  Student Portal
                </Link>
                <a href="#news-updates" className="selens-btn-secondary text-base px-6 py-3">
                  See latest news
                </a>
              </div>
            </div>

            <div
              className="lg:col-span-5 lg:border-l lg:border-selens-line lg:pl-8 space-y-4 selens-hero-item"
              style={{ animationDelay: '210ms' }}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400 block">
                Institutional Affiliations
              </span>
              <div className="space-y-3">
                {AFFILIATION_LOGOS.map((logo) => (
                  <div key={logo.src} className="flex items-center gap-3.5">
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="h-9 w-9 object-contain shrink-0"
                    />
                    <span className="text-sm font-sans font-medium text-neutral-200 leading-snug">
                      {logo.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SELENS & INSTITUTIONAL INDEX (Warm Paper-White, Borderless Hairlines) */}
      <section className="selens-section bg-selens-paper text-selens-paper-ink">
        <div className="selens-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left 5 cols: Editorial Intro */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-selens-paper-muted">
                  01 / Overview
                </p>
                <h2 className="font-serif selens-fluid-h2 font-bold text-selens-paper-ink">
                  About SELENS
                </h2>
                <div className="w-12 h-1 bg-selens-yellow" aria-hidden="true" />
              </div>

              <p className="text-base text-selens-paper-muted font-sans leading-relaxed">
                Empowering Electrical Engineering students at MSU-General Santos through academic support, technical services, and student leadership.
              </p>

              <div className="pt-1">
                <Link to="/about" className="selens-editorial-link">
                  <span>About the organization</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right 7 cols: Hairline-Ruled Key Pillars Index */}
            <Reveal
              index={0}
              className="lg:col-span-7 border-t-2 border-selens-paper-ink divide-y divide-selens-paper-rule"
            >
              {/* (a) Student Portal */}
              <div className="py-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div className="space-y-1.5 max-w-lg">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-selens-yellow text-selens-black rounded-[2px]">
                      A.Y. {CURRENT_ACADEMIC_YEAR}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-selens-paper-ink">
                      Student Portal
                    </h3>
                  </div>
                  <p className="text-sm text-selens-paper-muted leading-relaxed font-sans">
                    Access online student services, TEEchPoints tracking, and digital document requests.
                  </p>
                </div>
                <Link to="/portal" className="selens-editorial-link shrink-0">
                  <span>Access Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* (b) Legion of Topnotchers */}
              <div className="py-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div className="space-y-1.5 max-w-lg">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-selens-paper-ink text-selens-yellow rounded-[2px]">
                      {topnotchersCount > 0 ? `${topnotchersCount} Honorees` : 'PRC Honors'}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-selens-paper-ink">
                      Legion of Topnotchers
                    </h3>
                  </div>
                  <p className="text-sm text-selens-paper-muted leading-relaxed font-sans">
                    MSU-GSC Electrical Engineering alumni who ranked in the national Top 10 of the PRC Licensure Exams.
                  </p>
                </div>
                <Link to="/topnotchers" className="selens-editorial-link shrink-0">
                  <span>View Hall of Topnotchers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* (c) Programs & Initiatives */}
              <div className="py-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                <div className="space-y-1.5 max-w-lg">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-selens-paper-alt border border-selens-paper-rule text-selens-paper-ink rounded-[2px]">
                      {programsCount > 0 ? `${programsCount} Active` : `A.Y. ${CURRENT_ACADEMIC_YEAR}`}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-selens-paper-ink">
                      Programs &amp; Initiatives
                    </h3>
                  </div>
                  <p className="text-sm text-selens-paper-muted leading-relaxed font-sans">
                    Flagship academic, hardware lending, and community outreach projects led by student members.
                  </p>
                </div>
                <Link to="/projects" className="selens-editorial-link shrink-0">
                  <span>Explore All Programs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. NEWS & UPDATES (Stone Paper Broadsheet Rows) */}
      <section
        id="news-updates"
        className="border-t border-selens-paper-rule selens-section bg-selens-paper-alt text-selens-paper-ink"
      >
        <div className="selens-container space-y-10">
          <SectionHeading
            tone="paper"
            eyebrow="02 / Dispatches"
            title="News & Updates"
            description={`Recent announcements, event advisories, and activities for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
            action={
              <Link to="/news" className="selens-editorial-link">
                <span>Check out all news here</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          <div className="divide-y divide-selens-paper-rule border-t-2 border-b border-selens-paper-ink/80">
            {loadingNews ? (
              <div className="py-6 space-y-4">
                <div className="h-14 bg-selens-paper-card/70 rounded-[3px] animate-pulse" />
                <div className="h-14 bg-selens-paper-card/70 rounded-[3px] animate-pulse" />
              </div>
            ) : newsError ? (
              <div className="py-8 text-sm text-red-700 font-medium">
                {newsError}
              </div>
            ) : news.length > 0 ? (
              news.map((item, idx) => (
                <Reveal
                  index={idx}
                  key={item.id}
                  className="py-6 sm:py-7 hover:bg-selens-paper-card/65 transition-colors px-2 sm:px-3 flex flex-col md:flex-row md:items-baseline justify-between gap-3 md:gap-8 group"
                >
                  <div className="md:w-56 shrink-0 flex flex-wrap items-center gap-2 text-xs text-selens-paper-muted font-mono">
                    {item.published_at ? (
                      <time dateTime={item.published_at}>
                        {new Date(item.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    ) : (
                      <span>Recent</span>
                    )}
                    {item.committee && (
                      <span className="font-sans text-[11px] font-bold bg-selens-paper-ink text-selens-yellow px-2 py-0.5 rounded-[2px]">
                        {formatCommitteeLabel(item.committee)}
                      </span>
                    )}
                  </div>

                  <div className="flex-grow min-w-0 space-y-1.5">
                    <h3 className="font-serif selens-fluid-h3 font-bold text-selens-paper-ink group-hover:underline decoration-selens-yellow decoration-2 underline-offset-4">
                      <Link to={`/news/${item.slug}`}>{item.title}</Link>
                    </h3>
                    {item.excerpt && (
                      <p className="text-sm text-selens-paper-muted line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <Link to={`/news/${item.slug}`} className="selens-editorial-link text-xs">
                      <span>Read update</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Reveal>
              ))
            ) : (
              <div className="py-10 text-sm text-selens-paper-muted font-sans">
                New updates for A.Y. {CURRENT_ACADEMIC_YEAR} are coming soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. LATEST ACCOMPLISHMENTS (Warm Paper Borderless 3-Col Strip) */}
      <section className="selens-section border-t border-selens-paper-rule bg-selens-paper text-selens-paper-ink">
        <div className="selens-container space-y-10">
          <SectionHeading
            tone="paper"
            eyebrow="03 / Record"
            title="Latest accomplishments"
            description={`Student achievements, competition honors, and chapter milestones for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
            action={
              <Link to="/accomplishments" className="selens-editorial-link">
                <span>View all accomplishments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          {loadingAccomplishments ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-selens-paper-alt rounded-[3px] animate-pulse" />
              ))}
            </div>
          ) : accomplishmentsError ? (
            <div className="py-6 text-sm text-red-700 font-medium">
              {accomplishmentsError}
            </div>
          ) : accomplishments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-selens-paper-rule border-t-2 border-selens-paper-ink">
              {accomplishments.map((item, idx) => (
                <Reveal key={item.id} index={idx} className="h-full">
                  <Link
                    to={`/accomplishments/${item.slug}`}
                    className="py-6 md:px-6 first:md:pl-0 last:md:pr-0 h-full flex flex-col justify-between group space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between text-xs text-selens-paper-muted gap-2">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-wider bg-selens-yellow text-selens-black px-2 py-0.5 rounded-[2px]">
                          {item.category?.replace('_', ' ')}
                        </span>
                        {item.accomplished_on && (
                          <span className="font-mono">
                            {new Date(item.accomplished_on).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif selens-fluid-h3 font-bold text-selens-paper-ink group-hover:underline decoration-selens-yellow decoration-2 underline-offset-4 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-selens-paper-muted line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    <div className="pt-2 text-xs font-bold text-selens-paper-ink inline-flex items-center gap-1.5 min-h-[28px]">
                      <span>Read milestone</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="py-10 border-t border-selens-paper-rule text-sm text-selens-paper-muted">
              New accomplishments for A.Y. {CURRENT_ACADEMIC_YEAR} will be posted here soon.
            </div>
          )}
        </div>
      </section>

      {/* 5. PROJECTS & INITIATIVES (Numbered Engineering Specification Index, Zero Card Boxes) */}
      <section className="selens-section border-t border-selens-paper-rule bg-selens-paper-alt text-selens-paper-ink">
        <div className="selens-container space-y-10">
          <SectionHeading
            tone="paper"
            eyebrow="04 / Flagship Programs"
            title="Projects & Initiatives"
            description={`Student-driven initiatives supporting academic problem-solving, laboratory exploration, and technical outreach for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
            action={
              <Link to="/projects" className="selens-editorial-link">
                <span>Explore all initiatives</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {[
              {
                num: '01',
                title: 'ElectroStock',
                text: 'A hardware lending library providing multimeters, oscilloscope probes, microcontrollers, and circuit modules for laboratory experiments and capstone design projects.',
                to: '/projects#electrostock',
                linkText: 'Learn about ElectroStock',
              },
              {
                num: '02',
                title: 'EEngiquest',
                text: 'The annual flagship academic showdown where students across all year levels test their problem-solving skills in circuits, mathematics, power systems, and engineering design.',
                to: '/projects#eengiquest',
                linkText: 'Learn about EEngiquest',
              },
              {
                num: '03',
                title: 'TEEchPoints',
                text: 'Our digital recognition system tracking active membership. Earn points by attending technical seminars, volunteering for community drives, and representing the department.',
                to: '/projects#teechpoints',
                linkText: 'Learn about TEEchPoints',
              },
              {
                num: '04',
                title: 'Community outreach',
                text: 'Extending engineering beyond the campus through rural electrification assistance, energy conservation campaigns, and STEM workshops for local high schools.',
                to: '/projects#outreach',
                linkText: 'Learn about outreach',
              },
            ].map((prog, idx) => (
              <Reveal
                key={prog.num}
                index={idx}
                className="border-t-2 border-selens-paper-ink hover:border-selens-yellow pt-5 flex flex-col justify-between gap-4 transition-colors group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-bold tracking-widest text-selens-paper-muted">
                      {prog.num}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-selens-paper-ink">
                      {prog.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-selens-paper-muted font-sans leading-relaxed">
                    {prog.text}
                  </p>
                </div>
                <div>
                  <Link to={prog.to} className="selens-editorial-link">
                    <span>{prog.linkText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS FROM PAST ACADEMIC YEAR (Quiet Archival Strip) */}
      {pastYearHighlights && pastYearHighlights.items?.length > 0 && (
        <section className="bg-selens-paper border-t border-selens-paper-rule py-12 sm:py-16 text-selens-paper-ink">
          <div className="selens-container space-y-8">
            <SectionHeading
              tone="paper"
              eyebrow="Archive"
              title={`Highlights from A.Y. ${pastYearHighlights.year}`}
              description="Archived Milestones"
              action={
                <Link to="/news" className="selens-editorial-link text-xs">
                  <span>See the archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            <Reveal className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-selens-paper-rule border-t-2 border-selens-paper-ink">
              {pastYearHighlights.items.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="py-5 md:px-6 first:md:pl-0 last:md:pr-0 transition-colors flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-selens-paper-muted uppercase tracking-wider block">
                      {item.type}
                    </span>
                    <h3 className="font-serif font-bold text-base text-selens-paper-ink group-hover:underline decoration-selens-yellow decoration-2 underline-offset-4 line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-xs font-mono text-selens-paper-muted flex items-center justify-between pt-2">
                    <span>A.Y. {pastYearHighlights.year}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-selens-paper-ink transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* 6. MEET YOUR OFFICERS (Matte Black Gallery Band with Interactive TeamLanyardRail) */}
      <section className="w-full bg-selens-black text-selens-white border-y-2 border-selens-yellow selens-section">
        <div className="selens-container space-y-10">
          <SectionHeading
            tone="dark"
            eyebrow="05 / Leadership"
            title="Meet your officers"
            description={`The Executive Board leading the organization for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
            action={
              <Link to="/people" className="selens-editorial-link-dark">
                <span>See full officer directory</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          {loadingOfficers ? (
            <div className="h-[340px] bg-selens-surface border border-selens-line rounded-[4px] animate-pulse" />
          ) : officersError ? (
            <div className="p-6 text-center text-sm text-red-400 bg-selens-ink border border-selens-line rounded-[4px]">
              {officersError}
            </div>
          ) : officerLanyardItems.length > 0 ? (
            <TeamLanyardRail
              items={officerLanyardItems}
              caption="Hover, drag, pull down, or click a badge to flip"
            />
          ) : (
            <div className="text-center py-8 text-neutral-400 bg-selens-ink border border-selens-line rounded-[4px]">
              Officer directory will be updated shortly.
            </div>
          )}
        </div>
      </section>

      {/* 7. FIND US (Warm Paper Architectural Split) */}
      <section className="bg-selens-paper text-selens-paper-ink selens-section">
        <div className="selens-container space-y-10">
          <SectionHeading
            tone="paper"
            eyebrow="06 / Campus Headquarters"
            title="Find us"
            description="Visit our headquarters at the College of Engineering complex on the MSU-General Santos campus."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <Reveal
              index={0}
              className="lg:col-span-5 border-t-2 border-selens-paper-ink divide-y divide-selens-paper-rule"
            >
              <div className="py-5 flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-selens-paper-ink shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-selens-paper-ink">
                    Organization Headquarters
                  </h3>
                  <p className="text-sm text-selens-paper-muted leading-relaxed">
                    DEE Office, College of Engineering Building<br />
                    Mindanao State University - General Santos<br />
                    Fatima, General Santos City, 9500 Philippines
                  </p>
                </div>
              </div>

              <div className="py-5 flex items-start gap-3.5">
                <Clock className="w-5 h-5 text-selens-paper-ink shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-selens-paper-ink">
                    Officer Consultation Hours
                  </h3>
                  <p className="text-sm text-selens-paper-muted leading-relaxed">
                    Monday to Friday: 8:00 AM – 5:00 PM<br />
                    During regular academic semester periods.
                  </p>
                </div>
              </div>

              <div className="py-5 flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-selens-paper-ink shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-base text-selens-paper-ink">
                    Inquiries &amp; Communications
                  </h3>
                  <p className="text-sm">
                    <a
                      href="mailto:iieeasteeg@msugensan.edu.ph"
                      className="selens-editorial-link font-semibold"
                    >
                      iieeasteeg@msugensan.edu.ph
                    </a>
                  </p>
                </div>
              </div>

              <div className="pt-5">
                <a
                  href="https://msugensan.edu.ph"
                  target="_blank"
                  rel="noreferrer"
                  className="selens-editorial-link text-xs"
                >
                  <span>Visit MSU-General Santos Main Campus Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Reveal>

            <Reveal
              index={1}
              className="lg:col-span-7 bg-selens-paper-alt border border-selens-paper-rule rounded-[3px] p-6 sm:p-8 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase font-bold text-selens-paper-muted tracking-[0.18em] block">
                  Campus Location
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-selens-paper-ink">
                  College of Engineering Complex
                </h3>
                <p className="text-sm text-selens-paper-muted max-w-lg leading-relaxed">
                  Located along the northern quadrangle of the MSU-General Santos Fatima campus, adjacent to the University Science Complex and Library.
                </p>
              </div>

              <div className="aspect-[16/9] w-full rounded-[3px] border border-selens-paper-rule bg-selens-paper flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-11 h-11 rounded-[3px] bg-selens-paper-ink text-selens-yellow flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-serif font-bold text-sm sm:text-base text-selens-paper-ink block">
                    Engineering Building · DEE Office
                  </span>
                  <span className="font-mono text-xs text-selens-paper-muted">
                    6°05&apos;42&quot;N 125°07&apos;18&quot;E · Fatima Campus
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-selens-paper-muted border-t border-selens-paper-rule pt-3 font-mono">
                <span>Mindanao State University - General Santos</span>
                <span className="font-sans font-bold text-selens-paper-ink">COE Hub</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
