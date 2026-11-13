import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../../components/SharedUI'

const PORTAL_CARDS = [
  {
    title: 'TEEchPoints',
    badge: 'Coming soon',
    description: 'Track your participation and activity points across SELENS events.',
  },
  {
    title: 'Document Requests',
    badge: 'Coming soon',
    description: 'Request official organization certificates and endorsements online.',
  },
  {
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
      <div className="flex min-h-[65vh] items-center justify-center bg-selens-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-[4px] border-2 border-selens-line border-t-selens-yellow" />
          <p className="text-sm font-sans text-neutral-300">Loading student portal...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-selens-black text-selens-white min-h-[75vh]">
        <PageHeader
          title="Student Portal"
          description="Access your SELENS student account, services, and upcoming digital tools."
        />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 flex justify-center">
          <Card className="max-w-xl w-full space-y-6 p-8" hover={false}>
            <div className="space-y-3">
              <h2 className="font-serif text-2xl font-bold text-selens-white">
                Welcome to the SELENS Student Portal
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
                Sign in with your SELENS account or create a new student account using your @msugensan.edu.ph email address.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <PrimaryButton to="/portal/signin" className="justify-center">
                Sign in
              </PrimaryButton>
              <SecondaryButton to="/portal/signup" className="justify-center">
                Create account
              </SecondaryButton>
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
    <div className="bg-selens-black text-selens-white min-h-[75vh]">
      <PageHeader
        title="Student Portal"
        description="Your SELENS member dashboard and student services."
        action={
          <div className="flex flex-wrap items-center gap-3">
            {isOfficer && (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-[4px] bg-selens-yellow px-4 py-2 text-sm font-sans font-semibold text-selens-black hover:bg-selens-yellow/90 transition"
              >
                Officer Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center justify-center rounded-[4px] border border-selens-line bg-selens-ink px-4 py-2 text-sm font-sans font-medium text-selens-white hover:border-selens-yellow transition cursor-pointer"
            >
              Sign out
            </button>
          </div>
        }
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 space-y-8">
        <Card hover={false} className="space-y-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-selens-white">
              Welcome, {displayName}
            </h2>
            <div className="w-12 h-1 bg-selens-yellow" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-selens-line">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-400 font-sans">Email</p>
              <p className="text-sm text-selens-white font-sans mt-1 break-all">{displayEmail}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-400 font-sans">Student ID</p>
              <p className="text-sm text-selens-white font-sans mt-1">{displayStudentId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-400 font-sans">Year Level</p>
              <p className="text-sm text-selens-white font-sans mt-1">{displayYearLevel}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PORTAL_CARDS.map((item) => (
            <Card key={item.title} hover={false} className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif text-xl font-bold text-selens-white">{item.title}</h3>
                  <span className="inline-block rounded-[4px] border border-selens-yellow px-2.5 py-0.5 text-xs font-sans font-semibold text-selens-yellow">
                    {item.badge}
                  </span>
                </div>
                <p className="text-sm text-neutral-300 font-sans leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
