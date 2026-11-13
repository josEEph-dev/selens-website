import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CURRENT_ACADEMIC_YEAR, formatCommitteeLabel } from '../lib/config'
import {
  ArrowRight,
  Cpu,
  Trophy,
  Award,
  Users,
  MapPin,
  Clock,
  Mail,
  ExternalLink,
  Archive,
  Calendar,
} from 'lucide-react'

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

  return (
    <div className="bg-selens-black text-selens-white">
      {/* 2. HERO */}
      <section className="relative min-h-[500px] sm:min-h-[560px] flex items-center justify-center overflow-hidden border-b border-selens-line">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/website-assets/hero-background.jpg')" }}
        />
        <div className="absolute inset-0 bg-selens-black/80" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-selens-white max-w-3xl mx-auto leading-tight">
            Society of Electrical Engineering Students
          </h1>
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed font-sans">
            SELENS is the official student organization of Electrical Engineering students at MSU-General Santos. We organize academic events, build practical tools for our members, and celebrate our board exam topnotchers. Together, we empower students to excel in technical innovation and community leadership.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              to="/portal"
              className="bg-selens-yellow text-selens-black font-bold text-base px-6 py-3 rounded-[4px] hover:bg-selens-white transition"
            >
              Student Portal
            </Link>
            <a
              href="#news-updates"
              className="border border-selens-white text-selens-white font-semibold text-base px-6 py-3 rounded-[4px] hover:border-selens-yellow hover:text-selens-yellow transition"
            >
              See latest news
            </a>
          </div>
        </div>
      </section>

      {/* 3. HIGHLIGHT BLOCKS */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* (a) Student Portal */}
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-6 space-y-4 hover:border-selens-yellow transition flex flex-col justify-between">
            <div className="space-y-2">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
                A.Y. {CURRENT_ACADEMIC_YEAR}
              </div>
              <h3 className="font-serif font-bold text-lg text-selens-white">
                Student Portal
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                Access online student services, TEEchPoints tracking, and digital document requests.
              </p>
            </div>
            <Link
              to="/portal"
              className="text-sm font-semibold text-selens-yellow hover:text-selens-white flex items-center gap-1.5 transition pt-2"
            >
              <span>Access Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* (b) Legion of Topnotchers */}
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-6 space-y-4 hover:border-selens-yellow transition flex flex-col justify-between">
            <div className="space-y-2">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
                {topnotchersCount}
              </div>
              <h3 className="font-serif font-bold text-lg text-selens-white">
                Legion of Topnotchers
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                MSU-GSC Electrical Engineering alumni who ranked in the national Top 10 of the PRC Licensure Exams.
              </p>
            </div>
            <Link
              to="/topnotchers"
              className="text-sm font-semibold text-selens-yellow hover:text-selens-white flex items-center gap-1.5 transition pt-2"
            >
              <span>View Hall of Topnotchers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* (c) Programs & Initiatives */}
          <div className="bg-selens-ink border border-selens-line rounded-[4px] p-6 space-y-4 hover:border-selens-yellow transition flex flex-col justify-between">
            <div className="space-y-2">
              <div className="font-serif font-bold text-3xl sm:text-4xl text-selens-yellow">
                {programsCount > 0 ? `${programsCount} Active` : '0 Active'}
              </div>
              <h3 className="font-serif font-bold text-lg text-selens-white">
                Programs &amp; Initiatives
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                Flagship academic, hardware lending, and community outreach projects led by student members.
              </p>
            </div>
            <Link
              to="/projects"
              className="text-sm font-semibold text-selens-yellow hover:text-selens-white flex items-center gap-1.5 transition pt-2"
            >
              <span>Explore All Programs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. NEWS & UPDATES */}
      <section id="news-updates" className="border-t border-selens-line py-16 sm:py-20 bg-selens-ink">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-selens-line pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-selens-white">
                News &amp; Updates
              </h2>
              <div className="w-12 h-1 bg-selens-yellow mt-2" />
              <p className="text-sm text-neutral-300 mt-2">
                Recent announcements, event advisories, and activities for A.Y. {CURRENT_ACADEMIC_YEAR}.
              </p>
            </div>
          </div>

          <div className="divide-y divide-selens-line border-y border-selens-line bg-selens-black rounded-[4px]">
            {loadingNews ? (
              <div className="p-6 space-y-4">
                <div className="h-16 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
                <div className="h-16 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
              </div>
            ) : newsError ? (
              <div className="text-center py-10 px-4 text-sm text-red-400 bg-selens-ink rounded-[4px]">
                {newsError}
              </div>
            ) : news.length > 0 ? (
              news.map((item) => (
                <article
                  key={item.id}
                  className="p-5 sm:p-6 hover:bg-selens-ink transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 flex-grow">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-900 rounded-[4px] overflow-hidden shrink-0 hidden sm:flex items-center justify-center border border-selens-line">
                      {item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                        />
                      ) : (
                        <div className="w-full h-full bg-selens-ink flex items-center justify-center text-neutral-600">
                          <Cpu className="w-6 h-6 text-neutral-600" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 font-sans">
                        {item.committee && (
                          <span className="text-[11px] font-semibold text-selens-yellow bg-selens-black border border-selens-line px-1.5 py-0.5 rounded-[2px]">
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

                      <h3 className="font-serif text-lg font-bold text-selens-white group-hover:text-selens-yellow transition leading-snug">
                        <Link to={`/news/${item.slug}`}>
                          {item.title}
                        </Link>
                      </h3>

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
              ))
            ) : (
              <div className="text-center py-10 text-neutral-400">
                New updates for A.Y. {CURRENT_ACADEMIC_YEAR} are coming soon.
              </div>
            )}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-sm font-bold text-selens-yellow hover:text-selens-white transition underline underline-offset-4"
            >
              <span>Check out all news here</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* LATEST ACCOMPLISHMENTS BLOCK */}
      <section className="py-16 sm:py-20 border-t border-selens-line bg-selens-black">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-selens-line pb-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-selens-white">
                Latest accomplishments
              </h2>
              <div className="w-12 h-1 bg-selens-yellow mt-2" />
              <p className="text-sm text-neutral-300 mt-2">
                Student achievements, competition honors, and chapter milestones for A.Y. {CURRENT_ACADEMIC_YEAR}.
              </p>
            </div>
            <Link
              to="/accomplishments"
              className="text-sm font-semibold text-selens-yellow hover:text-selens-white flex items-center gap-1 transition"
            >
              <span>View all accomplishments</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingAccomplishments ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
              ))}
            </div>
          ) : accomplishmentsError ? (
            <div className="p-6 text-center text-sm text-red-400 bg-selens-ink border border-selens-line rounded-[4px]">
              {accomplishmentsError}
            </div>
          ) : accomplishments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {accomplishments.map((item) => (
                <Link
                  key={item.id}
                  to={`/accomplishments/${item.slug}`}
                  className="bg-selens-ink border border-selens-line rounded-[4px] p-6 hover:border-selens-yellow transition flex flex-col justify-between group space-y-4"
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
                    <h3 className="font-serif font-bold text-lg text-selens-white group-hover:text-selens-yellow transition leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-neutral-300 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-selens-line text-xs font-semibold text-selens-yellow flex items-center justify-between">
                    <span>Read milestone</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-400 bg-selens-ink border border-selens-line rounded-[4px]">
              New accomplishments for A.Y. {CURRENT_ACADEMIC_YEAR} will be posted here soon.
            </div>
          )}
        </div>
      </section>

      {/* 5. PROJECTS & INITIATIVES */}
      <section className="py-16 sm:py-20 border-t border-selens-line">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-10">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-selens-white">
              Projects &amp; Initiatives
            </h2>
            <div className="w-12 h-1 bg-selens-yellow mt-2" />
            <p className="text-base text-neutral-300 mt-2 max-w-2xl">
              Student-driven initiatives supporting academic problem-solving, laboratory exploration, and technical outreach for A.Y. {CURRENT_ACADEMIC_YEAR}.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-selens-ink border border-selens-line rounded-[4px] p-6 space-y-4 hover:border-selens-yellow transition">
              <div className="w-12 h-12 rounded-[4px] bg-selens-black border border-selens-line flex items-center justify-center text-selens-yellow">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-selens-white">
                  ElectroStock
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  A hardware lending library providing multimeters, oscilloscope probes, microcontrollers, and circuit modules for laboratory experiments and capstone design projects.
                </p>
              </div>
            </div>

            <div className="bg-selens-ink border border-selens-line rounded-[4px] p-6 space-y-4 hover:border-selens-yellow transition">
              <div className="w-12 h-12 rounded-[4px] bg-selens-black border border-selens-line flex items-center justify-center text-selens-yellow">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-selens-white">
                  EEngiquest
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  The annual flagship academic showdown where students across all year levels test their problem-solving skills in circuits, mathematics, power systems, and engineering design.
                </p>
              </div>
            </div>

            <div className="bg-selens-ink border border-selens-line rounded-[4px] p-6 space-y-4 hover:border-selens-yellow transition">
              <div className="w-12 h-12 rounded-[4px] bg-selens-black border border-selens-line flex items-center justify-center text-selens-yellow">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-selens-white">
                  TEEchPoints
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Our digital recognition system tracking active membership. Earn points by attending technical seminars, volunteering for community drives, and representing the department.
                </p>
              </div>
            </div>

            <div className="bg-selens-ink border border-selens-line rounded-[4px] p-6 space-y-4 hover:border-selens-yellow transition">
              <div className="w-12 h-12 rounded-[4px] bg-selens-black border border-selens-line flex items-center justify-center text-selens-yellow">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-selens-white">
                  Community outreach
                </h3>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Extending engineering beyond the campus through rural electrification assistance, energy conservation campaigns, and STEM workshops for local high schools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS FROM PAST ACADEMIC YEAR STRIP */}
      {pastYearHighlights && pastYearHighlights.items?.length > 0 && (
        <section className="bg-selens-ink border-t border-selens-line py-12 sm:py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-selens-line pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block">
                  Archived Milestones
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-selens-white mt-1 flex items-center gap-2">
                  <Archive className="w-5 h-5 text-selens-yellow shrink-0" />
                  <span>Highlights from A.Y. {pastYearHighlights.year}</span>
                </h2>
              </div>
              <Link
                to="/news"
                className="text-xs font-semibold text-selens-yellow hover:text-selens-white flex items-center gap-1 transition self-start sm:self-auto"
              >
                <span>See the archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {pastYearHighlights.items.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="p-5 bg-selens-black border border-selens-line rounded-[4px] hover:border-selens-yellow transition flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-selens-yellow uppercase tracking-wider block">
                      {item.type}
                    </span>
                    <h3 className="font-serif font-bold text-base text-selens-white group-hover:text-selens-yellow transition leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-xs text-neutral-400 flex items-center justify-between pt-3 border-t border-selens-line">
                    <span className="text-[11px] bg-selens-ink px-2 py-0.5 rounded-[2px] border border-selens-line">
                      Archive: A.Y. {pastYearHighlights.year}
                    </span>
                    <span className="text-selens-yellow font-semibold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. MEET YOUR OFFICERS */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20 space-y-10 border-t border-selens-line">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-selens-line pb-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-selens-white">
              Meet your officers
            </h2>
            <div className="w-12 h-1 bg-selens-yellow mt-2" />
            <p className="text-sm text-neutral-300 mt-2">
              The Executive Board leading the organization for A.Y. {CURRENT_ACADEMIC_YEAR}.
            </p>
          </div>
          <Link
            to="/people"
            className="text-sm font-semibold text-neutral-300 hover:text-selens-yellow flex items-center gap-1.5 transition"
          >
            <span>See full officer directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingOfficers ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 bg-selens-ink border border-selens-line rounded-[4px] animate-pulse" />
            ))}
          </div>
        ) : officersError ? (
          <div className="p-6 text-center text-sm text-red-400 bg-selens-ink border border-selens-line rounded-[4px]">
            {officersError}
          </div>
        ) : officers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {officers.map((officer) => (
              <Link
                key={officer.id}
                to="/people"
                className="bg-selens-ink border border-selens-line rounded-[4px] overflow-hidden hover:border-selens-yellow transition flex flex-col group"
              >
                <div className="aspect-square w-full bg-neutral-900 flex items-center justify-center relative overflow-hidden">
                  {officer.photo_url ? (
                    <img
                      src={officer.photo_url}
                      alt={officer.full_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-[4px] bg-selens-black border border-selens-line flex items-center justify-center text-selens-yellow font-serif font-bold text-lg">
                      {officer.full_name
                        ? officer.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                        : 'EE'}
                    </div>
                  )}
                </div>
                <div className="p-3 text-center space-y-1 flex-grow flex flex-col justify-center">
                  <h3 className="font-serif font-bold text-sm text-selens-white group-hover:text-selens-yellow transition leading-snug">
                    {officer.full_name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-sans leading-tight">
                    {officer.position}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-neutral-400 bg-selens-ink border border-selens-line rounded-[4px]">
            Officer directory will be updated shortly.
          </div>
        )}
      </section>

      {/* 7. FIND US */}
      <section className="bg-selens-ink border-t border-selens-line py-16 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-selens-white">
              Find us
            </h2>
            <div className="w-12 h-1 bg-selens-yellow mt-2" />
            <p className="text-sm text-neutral-300 mt-2 max-w-2xl">
              Visit our headquarters at the College of Engineering complex on the MSU-General Santos campus.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 bg-selens-black border border-selens-line rounded-[4px] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-[4px] bg-selens-ink border border-selens-line text-selens-yellow shrink-0">
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
                  <div className="p-2.5 rounded-[4px] bg-selens-ink border border-selens-line text-selens-yellow shrink-0">
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
                  <div className="p-2.5 rounded-[4px] bg-selens-ink border border-selens-line text-selens-yellow shrink-0">
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
                  className="inline-flex items-center gap-2 text-xs font-bold text-selens-white hover:text-selens-yellow transition"
                >
                  <span>Visit MSU-General Santos Main Campus Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-selens-yellow" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 bg-selens-black border border-selens-line rounded-[4px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-3 relative z-10">
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

              <div className="my-6 aspect-[16/9] w-full rounded-[4px] border border-selens-line bg-neutral-950 flex flex-col items-center justify-center p-6 relative group overflow-hidden">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, #FFD100 1px, transparent 0)',
                    backgroundSize: '24px 24px',
                  }}
                />

                <div className="relative z-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-[4px] bg-selens-yellow text-selens-black flex items-center justify-center mx-auto shadow-none">
                    <MapPin className="w-6 h-6" />
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
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
