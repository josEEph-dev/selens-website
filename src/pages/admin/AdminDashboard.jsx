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
  ArrowRight,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../../components/SharedUI'
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

  // Modules grid must include: News, Accomplishments, Awards, Projects, Topnotchers, FAQs, People
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
    <div className="bg-selens-black text-selens-white min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-8">
        <PageHeader
          title="Officer Dashboard"
          subtitle="Content management system and administrative portal for SELENS officers."
        />

        {error && (
          <div className="p-4 bg-selens-ink border border-red-500/50 rounded-[4px] text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Officer Profile Banner */}
        <Card className="border-selens-line">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-selens-yellow">
                <Shield className="w-4 h-4" />
                <span>Administrative Session • A.Y. {CURRENT_ACADEMIC_YEAR}</span>
              </div>
              <h2 className="text-xl font-bold font-serif text-selens-white">
                Welcome back, {profile?.full_name || 'Officer'}
              </h2>
              <p className="text-sm text-neutral-400">
                Signed in as <span className="text-selens-white font-medium">{profile?.email}</span> • Role:{' '}
                <span className="text-selens-yellow font-medium uppercase tracking-wide">
                  {profile?.role || 'Officer'}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <SecondaryButton
                to="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </SecondaryButton>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-selens-line hover:border-red-500/50 text-neutral-300 hover:text-red-400 text-xs font-semibold rounded-[4px] inline-flex items-center gap-2 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </Card>

        {/* My Directory Photo */}
        <Card className="border-selens-line space-y-4" hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-selens-line pb-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-selens-white">
                My People Directory Photo
              </h3>
              <p className="text-xs text-neutral-400 font-sans">
                Update only your own portrait photo shown on the public People page.
              </p>
            </div>
            {myPerson && (
              <span className="text-xs font-sans text-selens-yellow">
                Matched: {myPerson.full_name} ({myPerson.position})
              </span>
            )}
          </div>

          {photoFeedback && (
            <div
              role="status"
              className={`p-3 text-xs sm:text-sm font-medium rounded-[4px] border ${
                photoFeedback.type === 'success'
                  ? 'bg-selens-black border-selens-yellow text-selens-yellow'
                  : 'bg-selens-black border-red-500/50 text-red-400'
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
                <PrimaryButton type="submit" disabled={savingPhoto}>
                  {savingPhoto ? 'Saving...' : 'Save My Photo'}
                </PrimaryButton>
              </div>
            </form>
          ) : (
            <p className="text-sm text-neutral-400 font-sans">
              No People Directory entry matched your name ({profile?.full_name || '—'}) or email ({profile?.email || '—'}). Ask an admin to add or link your entry in People Directory.
            </p>
          )}
        </Card>

        {/* Modules Grid */}
        <div className="space-y-4">
          <div className="border-b border-selens-line pb-2 flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-selens-white">
              Content Management Modules
            </h3>
            <span className="text-xs text-neutral-400">
              Select a module to create or edit records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.filter((mod) => !mod.adminOnly || isAdmin).map((mod) => {
              const Icon = mod.icon
              return (
                <Link
                  key={mod.title}
                  to={mod.link}
                  className="bg-selens-ink border border-selens-line rounded-[4px] p-6 hover:border-selens-yellow transition flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-[4px] bg-selens-black border border-selens-line flex items-center justify-center text-selens-yellow group-hover:scale-105 transition">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-selens-yellow bg-selens-black px-2.5 py-1 rounded-[4px] border border-selens-line">
                        {mod.count} {mod.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-base text-selens-white group-hover:text-selens-yellow transition">
                        {mod.title}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed font-sans">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-selens-line/60 flex items-center justify-between text-xs font-semibold text-selens-yellow">
                    <span>Manage entries</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
