import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../lib/config'
import { SectionBadge, SectionHeading, FeatureCard, PhotoSlot, Waveform, Reveal, TeamLanyardRail } from '../components/ui'
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
    <div className="bg-selens-black text-selens-white">
      {/* 2. HERO */}
      <section className="relative lg:min-h-[80vh] flex items-center overflow-hidden border-b border-selens-line bg-selens-black">
        <HeroWaveformBackground />

        <div className="relative z-10 selens-container py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Pill Badge, Existing Headline & Subtext, Primary & Secondary Buttons */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="selens-hero-item" style={{ animationDelay: '0ms' }}>
                <SectionBadge>WELCOME TO SELENS</SectionBadge>
              </div>

              <h1
                className="font-serif selens-fluid-hero font-bold text-selens-white max-w-2xl selens-hero-item"
                style={{ animationDelay: '70ms' }}
              >
                Society of Electrical Engineering Students
              </h1>

              <p
                className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed font-sans selens-hero-item"
                style={{ animationDelay: '140ms' }}
              >
                SELENS is the official student organization of Electrical Engineering students at MSU-General Santos. We organize academic events, build practical tools for our members, and celebrate our board exam topnotchers. Together, we empower students to excel in technical innovation and community leadership.
              </p>

              <div
                className="flex flex-wrap items-center gap-4 pt-2 selens-hero-item"
                style={{ animationDelay: '210ms' }}
              >
                <Link to="/portal" className="selens-btn-primary text-base px-6 py-3">
                  Student Portal
                </Link>
                <a href="#news-updates" className="selens-btn-secondary text-base px-6 py-3">
                  See latest news
                </a>
              </div>
            </div>

            {/* Right Column: Large PhotoSlot (4:3 on mobile, 16:10 on desktop) */}
            <div className="lg:col-span-5 selens-hero-item" style={{ animationDelay: '280ms' }}>
              <PhotoSlot
                aspect="4/3"
                className="lg:aspect-[16/10]"
                caption="[CONFIRM: Hero photo of SELENS officers, general assembly, or College of Engineering]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* AFFILIATIONS ROW */}
      <section
        aria-label="Institutional affiliations"
        className="border-b border-selens-line bg-selens-surface py-6 sm:py-8"
      >
        <div className="selens-container flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-0.5">
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-neutral-400 block">
              Institutional Affiliations
            </span>
            <span className="text-xs text-neutral-500 font-sans block">
              [CONFIRM: which affiliations to show]
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            {AFFILIATION_LOGOS.map((logo) => (
              <div
                key={logo.src}
                className="group flex items-center gap-3 grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition duration-200"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0"
                />
                <span className="text-xs sm:text-sm font-sans font-medium text-neutral-400 group-hover:text-selens-white transition-colors">
                  {logo.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ABOUT INTRO & KEY HIGHLIGHTS (Two columns: text/highlights + PhotoSlot) */}
      <section className="selens-section bg-selens-black">
        <div className="selens-container space-y-12">
          <SectionHeading
            title="About SELENS"
            description="Empowering Electrical Engineering students at MSU-General Santos through academic support, technical services, and student leadership."
            action={
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-selens-yellow hover:text-selens-white transition-colors"
              >
                <span>About the organization</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Editorial Intro & Key Organization Pillars */}
            <Reveal index={0} className="lg:col-span-7 space-y-6">
              <div className="divide-y divide-selens-line border border-selens-line rounded-[4px] bg-selens-ink">
                {/* (a) Student Portal */}
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif font-bold text-xl sm:text-2xl text-selens-yellow">
                        A.Y. {CURRENT_ACADEMIC_YEAR}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-selens-white">
                        Student Portal
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                      Access online student services, TEEchPoints tracking, and digital document requests.
                    </p>
                  </div>
                  <Link
                    to="/portal"
                    className="text-sm font-semibold text-selens-yellow hover:text-selens-white inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>Access Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* (b) Legion of Topnotchers */}
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif font-bold text-xl sm:text-2xl text-selens-yellow">
                        {topnotchersCount}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-selens-white">
                        Legion of Topnotchers
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                      MSU-GSC Electrical Engineering alumni who ranked in the national Top 10 of the PRC Licensure Exams.
                    </p>
                  </div>
                  <Link
                    to="/topnotchers"
                    className="text-sm font-semibold text-selens-yellow hover:text-selens-white inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>View Hall of Topnotchers</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* (c) Programs & Initiatives */}
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-lg">
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif font-bold text-xl sm:text-2xl text-selens-yellow">
                        {programsCount > 0 ? `${programsCount} Active` : '0 Active'}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-selens-white">
                        Programs &amp; Initiatives
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                      Flagship academic, hardware lending, and community outreach projects led by student members.
                    </p>
                  </div>
                  <Link
                    to="/projects"
                    className="text-sm font-semibold text-selens-yellow hover:text-selens-white inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <span>Explore All Programs</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Right Column: PhotoSlot */}
            <Reveal index={1} className="lg:col-span-5">
              <PhotoSlot
                aspect="4/3"
                caption="[CONFIRM: Department of Electrical Engineering or student activity photo]"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. NEWS & UPDATES (List rows: date, headline, one-line excerpt) */}
      <section id="news-updates" className="border-t border-selens-line selens-section bg-selens-surface">
        <div className="selens-container space-y-10">
          <SectionHeading
            title="News & Updates"
            description={`Recent announcements, event advisories, and activities for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
            action={
              <Link
                to="/news"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-selens-yellow hover:text-selens-white transition-colors"
              >
                <span>Check out all news here</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          <div className="divide-y divide-selens-line border-y border-selens-line">
            {loadingNews ? (
              <div className="py-6 space-y-4">
                <div className="h-16 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
                <div className="h-16 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
              </div>
            ) : newsError ? (
              <div className="text-center py-10 px-4 text-sm text-red-400 bg-selens-ink rounded-[4px]">
                {newsError}
              </div>
            ) : news.length > 0 ? (
              news.map((item, idx) => (
                <Reveal
                  as="article"
                  index={idx}
                  key={item.id}
                  className="py-5 sm:py-6 px-2 sm:px-4 hover:bg-selens-ink/70 transition-colors flex flex-col md:flex-row md:items-baseline justify-between gap-3 md:gap-8 group"
                >
                  {/* Date & Committee column */}
                  <div className="md:w-56 shrink-0 flex flex-wrap items-center gap-2 text-xs text-neutral-400 font-sans">
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
                      <span className="text-[11px] font-semibold text-selens-yellow bg-selens-black border border-selens-line px-1.5 py-0.5 rounded-[2px]">
                        {formatCommitteeLabel(item.committee)}
                      </span>
                    )}
                  </div>

                  {/* Headline & one-line excerpt */}
                  <div className="flex-grow min-w-0 space-y-1">
                    <h3 className="font-serif selens-fluid-h3 font-bold text-selens-white group-hover:text-selens-yellow transition-colors">
                      <Link to={`/news/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h3>
                    {item.excerpt && (
                      <p className="text-sm text-neutral-300 line-clamp-1 leading-relaxed">
                        {item.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Action link */}
                  <div className="shrink-0">
                    <Link
                      to={`/news/${item.slug}`}
                      className="text-xs font-semibold text-selens-yellow group-hover:text-selens-white inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Read update</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </Reveal>
              ))
            ) : (
              <div className="text-center py-10 text-neutral-400">
                New updates for A.Y. {CURRENT_ACADEMIC_YEAR} are coming soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* LATEST ACCOMPLISHMENTS BLOCK (3-column equal-height cards with line-clamp) */}
      <section className="selens-section border-t border-selens-line bg-selens-black">
        <div className="selens-container space-y-10">
          <SectionHeading
            title="Latest accomplishments"
            description={`Student achievements, competition honors, and chapter milestones for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
            action={
              <Link
                to="/accomplishments"
                className="text-sm font-semibold text-selens-yellow hover:text-selens-white inline-flex items-center gap-1.5 transition-colors"
              >
                <span>View all accomplishments</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          {loadingAccomplishments ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
              ))}
            </div>
          ) : accomplishmentsError ? (
            <div className="p-6 text-center text-sm text-red-400 bg-selens-ink border border-selens-line rounded-[4px]">
              {accomplishmentsError}
            </div>
          ) : accomplishments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {accomplishments.map((item, idx) => (
                <Reveal key={item.id} index={idx} className="h-full">
                  <Link
                    to={`/accomplishments/${item.slug}`}
                    className="selens-card p-6 h-full flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-semibold text-selens-yellow uppercase tracking-wider">
                            {item.category?.replace('_', ' ')}
                          </span>
                          {item.committee && (
                            <span className="text-[11px] text-neutral-400">
                              • {formatCommitteeLabel(item.committee)}
                            </span>
                          )}
                        </div>
                        {item.accomplished_on && (
                          <span>
                            {new Date(item.accomplished_on).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif selens-fluid-h3 font-bold text-selens-white group-hover:text-selens-yellow transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-selens-line text-xs font-semibold text-selens-yellow flex items-center justify-between">
                      <span>Read milestone</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-400 bg-selens-ink border border-selens-line rounded-[4px]">
              New accomplishments for A.Y. {CURRENT_ACADEMIC_YEAR} will be posted here soon.
            </div>
          )}
        </div>
      </section>

      {/* 5. PROJECTS & INITIATIVES (2-column grid of equal-height FeatureCards, distinct from 3-col Accomplishments) */}
      <section className="selens-section border-t border-selens-line bg-selens-surface">
        <div className="selens-container space-y-10">
          <SectionHeading
            title="Projects & Initiatives"
            description={`Student-driven initiatives supporting academic problem-solving, laboratory exploration, and technical outreach for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
            action={
              <Link
                to="/projects"
                className="text-sm font-semibold text-selens-yellow hover:text-selens-white inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Explore all initiatives</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <Reveal index={0} className="h-full">
              <FeatureCard
                title="ElectroStock"
                text="A hardware lending library providing multimeters, oscilloscope probes, microcontrollers, and circuit modules for laboratory experiments and capstone design projects."
                to="/projects#electrostock"
                linkText="Learn about ElectroStock"
              />
            </Reveal>

            <Reveal index={1} className="h-full">
              <FeatureCard
                title="EEngiquest"
                text="The annual flagship academic showdown where students across all year levels test their problem-solving skills in circuits, mathematics, power systems, and engineering design."
                to="/projects#eengiquest"
                linkText="Learn about EEngiquest"
              />
            </Reveal>

            <Reveal index={2} className="h-full">
              <FeatureCard
                title="TEEchPoints"
                text="Our digital recognition system tracking active membership. Earn points by attending technical seminars, volunteering for community drives, and representing the department."
                to="/projects#teechpoints"
                linkText="Learn about TEEchPoints"
              />
            </Reveal>

            <Reveal index={3} className="h-full">
              <FeatureCard
                title="Community outreach"
                text="Extending engineering beyond the campus through rural electrification assistance, energy conservation campaigns, and STEM workshops for local high schools."
                to="/projects#outreach"
                linkText="Learn about outreach"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS FROM PAST ACADEMIC YEAR (Quiet Archive Strip) */}
      {pastYearHighlights && pastYearHighlights.items?.length > 0 && (
        <section className="bg-selens-black border-t border-selens-line py-12 sm:py-16">
          <div className="selens-container space-y-8">
            <SectionHeading
              title={`Highlights from A.Y. ${pastYearHighlights.year}`}
              description="Archived Milestones"
              action={
                <Link
                  to="/news"
                  className="text-xs font-semibold text-selens-yellow hover:text-selens-white inline-flex items-center gap-1 transition-colors"
                >
                  <span>See the archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            <Reveal className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-selens-line border border-selens-line rounded-[4px] bg-selens-ink">
              {pastYearHighlights.items.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="p-5 hover:bg-selens-elevated transition-colors flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-selens-yellow uppercase tracking-wider block">
                      {item.type}
                    </span>
                    <h3 className="font-serif font-bold text-base text-selens-white group-hover:text-selens-yellow transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-xs text-neutral-400 flex items-center justify-between pt-2">
                    <span>Archive: A.Y. {pastYearHighlights.year}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-selens-yellow" />
                  </div>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* 6. MEET YOUR OFFICERS (Full-width band showing the Executive Board compactly) */}
      <section className="w-full bg-selens-black border-t border-selens-line selens-section">
        <div className="selens-container space-y-10">
          <SectionHeading
            title="Meet your officers"
            description={`The Executive Board leading the organization for A.Y. ${CURRENT_ACADEMIC_YEAR}.`}
            action={
              <Link
                to="/people"
                className="text-sm font-semibold text-selens-yellow hover:text-selens-white inline-flex items-center gap-1.5 transition-colors"
              >
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

      {/* 7. FIND US */}
      <section className="bg-selens-surface border-t border-selens-line selens-section">
        <div className="selens-container space-y-10">
          <SectionHeading
            title="Find us"
            description="Visit our headquarters at the College of Engineering complex on the MSU-General Santos campus."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <Reveal index={0} className="lg:col-span-5 bg-selens-ink border border-selens-line rounded-[4px] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-[4px] bg-selens-black border border-selens-line text-selens-yellow shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-base text-selens-white">
                      Organization Headquarters
                    </h3>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      DEE Office, College of Engineering Building<br />
                      Mindanao State University - General Santos<br />
                      Fatima, General Santos City, 9500 Philippines
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-[4px] bg-selens-black border border-selens-line text-selens-yellow shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-base text-selens-white">
                      Officer Consultation Hours
                    </h3>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      Monday to Friday: 8:00 AM – 5:00 PM<br />
                      During regular academic semester periods.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-[4px] bg-selens-black border border-selens-line text-selens-yellow shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-base text-selens-white">
                      Inquiries &amp; Communications
                    </h3>
                    <p className="text-sm text-neutral-300">
                      <a href="mailto:iieeasteeg@msugensan.edu.ph" className="text-selens-yellow hover:underline">
                        iieeasteeg@msugensan.edu.ph
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-selens-line">
                <a
                  href="https://msugensan.edu.ph"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-selens-white hover:text-selens-yellow transition-colors"
                >
                  <span>Visit MSU-General Santos Main Campus Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-selens-yellow" />
                </a>
              </div>
            </Reveal>

            <Reveal index={1} className="lg:col-span-7 bg-selens-ink border border-selens-line rounded-[4px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-2 relative z-10">
                <span className="text-xs uppercase font-bold text-selens-yellow tracking-wider block">
                  Campus Location
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-selens-white">
                  College of Engineering Complex
                </h3>
                <p className="text-sm text-neutral-300 max-w-lg leading-relaxed">
                  Located along the northern quadrangle of the MSU-General Santos Fatima campus, adjacent to the University Science Complex and Library.
                </p>
              </div>

              <div className="my-6 aspect-[16/9] w-full rounded-[4px] border border-selens-line bg-selens-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="relative z-10 text-center space-y-3">
                  <div className="w-11 h-11 rounded-[4px] bg-selens-ink border border-selens-line text-selens-yellow flex items-center justify-center mx-auto">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-serif font-bold text-sm text-selens-white block">
                      Engineering Building • DEE Office
                    </span>
                    <span className="text-xs text-neutral-400">
                      6°05&apos;42&quot;N 125°07&apos;18&quot;E • Fatima Campus
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 relative z-10 border-t border-selens-line pt-3">
                <span>Mindanao State University - General Santos</span>
                <span className="text-selens-yellow font-semibold">COE Hub</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
