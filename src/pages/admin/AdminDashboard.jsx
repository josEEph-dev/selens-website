import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { dataApi, supabase } from '../../lib/supabase'
import ImageUploader from '../../components/ImageUploader'
import {
  Shield,
  BookOpen,
  Users,
  Award,
  Sparkles,
  HelpCircle,
  Trophy,
  Layers,
  ArrowUpRight,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { PageHeader } from '../../components/SharedUI'
import { CURRENT_ACADEMIC_YEAR } from '../../lib/config'

export default function AdminDashboard() {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [counts, setCounts] = useState({
    news: 0,
    accomplishments: 0,
    projects: 0,
    people: 0,
    topnotchers: 0,
    awards: 0,
    faqs: 0,
  })
  const [error, setError] = useState(null)
  const [myPerson, setMyPerson] = useState(null)
  const [myPhotoUrl, setMyPhotoUrl] = useState('')
  const [savingPhoto, setSavingPhoto] = useState(false)
  const [photoFeedback, setPhotoFeedback] = useState(null)

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta.content = 'noindex, nofollow'
    return () => {
      if (meta) meta.content = 'index, follow'
    }
  }, [])

  useEffect(() => {
    let ignore = false
    async function loadStats() {
      try {
        const [n, acc, proj, p, t, a, f] = await Promise.all([
          dataApi.list('news_posts'),
          dataApi.list('accomplishments'),
          dataApi.list('projects'),
          dataApi.list('people'),
          dataApi.list('topnotchers'),
          dataApi.list('awards'),
          dataApi.list('faqs'),
        ])
        if (!ignore) {
          setCounts({
            news: n.length,
            accomplishments: acc.length,
            projects: proj.length,
            people: p.length,
            topnotchers: t.length,
            awards: a.length,
            faqs: f.length,
          })

          const normEmail = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ')
          const normName = (s) =>
            (s || '')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .replace(/[.,]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
          const stripMi = (s) => s.replace(/ [a-z] /g, ' ').replace(/\s+/g, ' ').trim()

          const myEmail = normEmail(profile?.email)
          const myFull = normName(profile?.full_name)
          const myFirst = normName(profile?.first_name)
          const myMiddle = normName(profile?.middle_name)
          const mySurname = normName(profile?.surname)
          const candidates = new Set(
            [
              myFull,
              myFull ? stripMi(myFull) : '',
              myFirst && mySurname ? `${myFirst} ${mySurname}` : '',
              myFirst && myMiddle && mySurname ? `${myFirst} ${myMiddle[0]} ${mySurname}` : '',
              myFirst && myMiddle && mySurname ? `${myFirst} ${myMiddle} ${mySurname}` : '',
            ].filter(Boolean)
          )

          const match =
            (myEmail && p.find((row) => normEmail(row.email) === myEmail)) ||
            (candidates.size > 0 &&
              p.find((row) => {
                const target = normName(row.full_name)
                return candidates.has(target) || candidates.has(stripMi(target))
              })) ||
            null
          setMyPerson(match)
          setMyPhotoUrl(match?.photo_url || '')
        }
      } catch (err) {
        console.error('[AdminDashboard] Error loading stats:', err)
        if (!ignore) {
          setError(err.message || 'Failed to load module statistics.')
        }
      }
    }
    loadStats()
    return () => { ignore = true }
  }, [profile?.email, profile?.full_name, profile?.first_name, profile?.middle_name, profile?.surname])

  const handleSaveMyPhoto = async (e) => {
    e.preventDefault()
    if (!myPerson) return
    setSavingPhoto(true)
    setPhotoFeedback(null)
    try {
      const { data, error: updateError } = await supabase
        .from('people')
        .update({ photo_url: myPhotoUrl })
        .eq('id', myPerson.id)
        .select()
        .single()
      if (updateError) throw updateError
      setMyPerson(data)
      setMyPhotoUrl(data.photo_url || '')
      setPhotoFeedback({ type: 'success', message: 'Your People Directory photo has been updated.' })
    } catch (err) {
      setPhotoFeedback({
        type: 'error',
        message: err.message || 'Could not update your directory photo.',
      })
    } finally {
      setSavingPhoto(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const modules = [
    {
      title: 'News & Announcements',
      desc: 'Publish official bulletins and student event recaps.',
      link: '/dashboard/news',
      icon: BookOpen,
      count: counts.news,
      label: 'Articles',
    },
    {
      title: 'Accomplishments',
      desc: 'Curate student milestones, competition wins, and community outreach projects.',
      link: '/dashboard/accomplishments',
      icon: Trophy,
      count: counts.accomplishments,
      label: 'Accomplishments',
    },
    {
      title: 'Accreditations & Awards',
      desc: 'Curate institutional achievements, board passing rates, and student society honors.',
      link: '/dashboard/awards',
      icon: Award,
      count: counts.awards,
      label: 'Awards',
    },
    {
      title: 'Projects & Initiatives',
      desc: 'Manage departmental student projects, laboratory resources, and outreach programs.',
      link: '/dashboard/projects',
      icon: Layers,
      count: counts.projects,
      label: 'Projects',
    },
    {
      title: 'Legion of Topnotchers',
      desc: 'Update or reorder electrical engineering licensure examination topnotcher honorees in the registry.',
      link: '/dashboard/topnotchers',
      icon: Sparkles,
      count: counts.topnotchers,
      label: 'Honorees',
      adminOnly: true,
    },
    {
      title: 'FAQ Knowledge Base',
      desc: 'Manage public frequently asked questions covering membership and student services.',
      link: '/dashboard/faqs',
      icon: HelpCircle,
      count: counts.faqs,
      label: 'Entries',
    },
    {
      title: 'People Directory',
      desc: 'Manage Executive Board members, legislative representatives, and advisers.',
      link: '/dashboard/people',
      icon: Users,
      count: counts.people,
      label: 'Personnel',
      adminOnly: true,
    },
  ]

  return (
    <div id="main-content" className="selens-paper-page min-h-screen pb-14">
      <PageHeader
        title="Officer Dashboard"
        description="Content management system and administrative portal for SELENS officers."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="m-btn-2 m-btn-2--dark"
            >
              <span className="m-btn-2__label">Live Site</span>
              <span className="m-btn-2__icon" aria-hidden="true">
                <ExternalLink className="w-4 h-4" />
              </span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="m-btn-2 m-btn-2--dark cursor-pointer"
            >
              <span className="m-btn-2__label">
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </span>
            </button>
          </div>
        }
      />

      <div className="selens-container py-8 sm:py-12 space-y-8">
        {error && (
          <div className="rounded-[18px] border border-red-200 bg-red-50 px-5 py-4 m-text-6 text-red-800">
            {error}
          </div>
        )}

        {/* Officer Profile Summary Card (Matches Student Portal with Black/Yellow Accent) */}
        <div className="m-panel-light m-shadow p-6 sm:p-9 space-y-5 border-t-4 border-[#FFD100]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Administrative Session · A.Y. {CURRENT_ACADEMIC_YEAR}</span>
              </div>
              <h2 className="m-text-3 text-[#121315] break-words">
                Welcome back, {profile?.full_name || 'Officer'}
              </h2>
              <p className="m-text-6 text-[#4d5158] break-all">
                Signed in as <span className="text-[#121315] font-medium">{profile?.email}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-[#FFD100] text-[#121315] m-text-4 capitalize">
                Role: {profile?.role || 'Officer'}
              </span>
              <Link to="/portal" className="m-btn-2 m-btn-2--mist">
                <span className="m-btn-2__label">Student Portal</span>
                <span className="m-btn-2__icon" aria-hidden="true">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* My People Directory Photo */}
        <div className="m-panel-light m-shadow p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cdd0d4] pb-4">
            <div>
              <h3 className="m-text-5 text-[#121315]">
                My People Directory Photo
              </h3>
              <p className="m-text-6 text-[#4d5158] mt-0.5">
                Update only your own portrait photo shown on the public People page.
              </p>
            </div>
            {myPerson && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium w-fit">
                Matched: {myPerson.full_name} ({myPerson.position})
              </span>
            )}
          </div>

          {photoFeedback && (
            <div
              role="status"
              className={`p-3.5 m-text-6 font-medium rounded-[14px] border ${
                photoFeedback.type === 'success'
                  ? 'bg-[#121315] border-[#121315] text-[#FFD100]'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {photoFeedback.message}
            </div>
          )}

          {myPerson ? (
            <form onSubmit={handleSaveMyPhoto} className="space-y-4">
              <ImageUploader
                label="Portrait Photo"
                value={myPhotoUrl}
                onChange={setMyPhotoUrl}
                placeholder="https://... or upload your portrait (<1MB)"
              />
              <div className="flex justify-end">
                <button type="submit" disabled={savingPhoto} className="m-btn">
                  <span className="m-btn__label">
                    {savingPhoto ? 'Saving...' : 'Save My Photo'}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <p className="m-text-6 text-[#4d5158]">
              No People Directory entry matched your name ({profile?.full_name || '—'}) or email ({profile?.email || '—'}). Ask an admin to add or link your entry in People Directory.
            </p>
          )}
        </div>

        {/* Modules Grid */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <h3 className="m-text-3 text-[#121315]">
              Content management<span className="text-[#FFD100]">.</span>
            </h3>
            <span className="m-text-6 text-[#4d5158]">
              Select a module to create or edit records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.filter((mod) => !mod.adminOnly || isAdmin).map((mod) => {
              const Icon = mod.icon
              return (
                <Link
                  key={mod.title}
                  to={mod.link}
                  className="m-surface no-underline flex flex-col justify-between gap-6 group transition-all hover:shadow-[0_22px_44px_-24px_rgba(18,19,21,0.45)]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#121315] text-[#FFD100] flex items-center justify-center group-hover:bg-[#FFD100] group-hover:text-[#121315] transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#e7e8ea] text-[#121315] text-xs font-medium tabular-nums">
                        {mod.count} {mod.label}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="m-text-5 text-[#121315]">
                        {mod.title}
                      </h4>
                      <p className="m-text-6 text-[#4d5158]">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-[#cdd0d4] flex items-center justify-between m-text-4 text-[#121315]">
                    <span>Manage entries</span>
                    <span className="w-8 h-8 rounded-full bg-[#121315] text-[#FFD100] inline-flex items-center justify-center group-hover:bg-[#FFD100] group-hover:text-[#121315] transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
