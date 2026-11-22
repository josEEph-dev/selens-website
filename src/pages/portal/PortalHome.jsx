import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { PageHeader, Card } from '../../components/SharedUI'

const PORTAL_CARDS = [
  {
    num: '01',
    title: 'TEEchPoints',
    badge: 'Coming soon',
    description: 'Track your participation and activity points across SELENS events.',
  },
  {
    num: '02',
    title: 'Document Requests',
    badge: 'Coming soon',
    description: 'Request official organization certificates and endorsements online.',
  },
  {
    num: '03',
    title: 'EEngiquest',
    badge: 'Coming soon',
    description: 'Use your SELENS account',
  },
]

export default function PortalHome() {
  const { user, profile, loading, isOfficer, signOut } = useAuth()
  const [studentProfile, setStudentProfile] = useState(null)

  useEffect(() => {
    let active = true
    async function loadProfile() {
      if (!user?.id || !isSupabaseConfigured || !supabase) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name, student_id, year_level, role')
        .eq('id', user.id)
        .single()
      if (active && data) {
        setStudentProfile(data)
      }
    }
    loadProfile()
    return () => {
      active = false
    }
  }, [user?.id])

  if (loading) {
    return (
      <div id="main-content" className="selens-paper-page flex min-h-[65vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-[3px] border-2 border-selens-paper-rule border-t-selens-paper-ink" />
          <p className="text-sm font-sans text-selens-paper-muted">Loading student portal...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div id="main-content" className="selens-paper-page min-h-[75vh]">
        <PageHeader
          eyebrow="Member Services"
          title="Student Portal"
          description="Access your SELENS student account, services, and upcoming digital tools."
        />

        <div className="selens-container py-14 flex justify-center">
          <Card className="max-w-xl w-full space-y-6 p-6 sm:p-8" hover={false}>
            <div className="space-y-3">
              <h2 className="font-serif text-2xl font-bold text-selens-paper-ink">
                Welcome to the SELENS Student Portal
              </h2>
              <div className="w-12 h-1 bg-selens-yellow" aria-hidden="true" />
              <p className="text-sm sm:text-base text-selens-paper-muted font-sans leading-relaxed">
                Sign in with your SELENS account or create a new student account using your @msugensan.edu.ph email address.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/portal/signin" className="selens-btn-ink justify-center">
                Sign in
              </Link>
              <Link to="/portal/signup" className="selens-btn-paper-outline justify-center">
                Create account
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const displayName =
    studentProfile?.full_name ||
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.email
  const displayEmail = user.email || profile?.email || '—'
  const displayStudentId =
    studentProfile?.student_id ||
    profile?.student_id ||
    user.user_metadata?.student_id ||
    '—'
  const displayYearLevel =
    studentProfile?.year_level ||
    profile?.year_level ||
    user.user_metadata?.year_level ||
    '—'

  return (
    <div id="main-content" className="selens-paper-page min-h-[75vh]">
      <PageHeader
        eyebrow="Member Dashboard"
        title="Student Portal"
        description="Your SELENS member dashboard and student services."
        action={
          <div className="flex flex-wrap items-center gap-3">
            {isOfficer && (
              <Link to="/dashboard" className="selens-btn-primary text-sm">
                Officer Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="selens-btn-secondary text-sm"
            >
              Sign out
            </button>
          </div>
        }
      />

      <div className="selens-container py-12 space-y-12">
        <Card hover={false} className="space-y-5 p-6 sm:p-8">
          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-selens-paper-ink break-words">
              Welcome, {displayName}
            </h2>
            <div className="w-12 h-1 bg-selens-yellow" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-selens-paper-rule">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-selens-paper-muted">Email</p>
              <p className="text-sm font-semibold text-selens-paper-ink font-sans mt-1 break-all">{displayEmail}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-selens-paper-muted">Student ID</p>
              <p className="text-sm font-mono font-semibold text-selens-paper-ink mt-1">{displayStudentId}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-selens-paper-muted">Year Level</p>
              <p className="text-sm font-semibold text-selens-paper-ink font-sans mt-1">{displayYearLevel}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-selens-paper-rule border-t-2 border-selens-paper-ink">
          {PORTAL_CARDS.map((item) => (
            <div key={item.title} className="py-6 md:px-6 first:md:pl-0 last:md:pr-0 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-selens-paper-muted">
                  {item.num}
                </span>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider bg-selens-paper-ink text-selens-yellow px-2 py-0.5 rounded-[2px]">
                  {item.badge}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-selens-paper-ink">{item.title}</h3>
              <p className="text-sm text-selens-paper-muted font-sans leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
