import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { PageHeader } from '../../components/SharedUI'
import { ArrowUpRight } from 'lucide-react'

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
      <div id="main-content" className="selens-paper-page flex min-h-[70vh] items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#cdd0d4] border-t-[#121315]" />
          <p className="m-text-6 text-[#4d5158]">Loading student portal...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div id="main-content" className="selens-paper-page min-h-[75vh]">
        <PageHeader
          title="Student Portal"
          description="Access your SELENS student account, services, and upcoming digital tools."
        />

        <div className="selens-container py-12 sm:py-16 flex justify-center">
          <div className="m-panel-light m-shadow max-w-xl w-full p-7 sm:p-10 space-y-6">
            <div className="space-y-2.5">
              <h2 className="m-text-5 text-[#121315]">
                Welcome to the SELENS Student Portal
              </h2>
              <p className="m-text text-[#4d5158]">
                Sign in with your SELENS account or create a new student account using your @msugensan.edu.ph email address.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link to="/portal/signin" className="m-btn">
                <span className="m-btn__label">Sign in</span>
              </Link>
              <Link to="/portal/signup" className="m-btn-2 m-btn-2--mist">
                <span className="m-btn-2__label">Create account</span>
                <span className="m-btn-2__icon" aria-hidden="true">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
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
        title="Student Portal"
        description="Your SELENS member dashboard and student services."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            {isOfficer && (
              <Link to="/dashboard" className="m-btn-2 m-btn-2--dark">
                <span className="m-btn-2__label">Officer Dashboard</span>
                <span className="m-btn-2__icon" aria-hidden="true">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="m-btn-2 m-btn-2--dark cursor-pointer"
            >
              <span className="m-btn-2__label">Sign out</span>
            </button>
          </div>
        }
      />

      <div className="selens-container py-10 sm:py-14 space-y-8">
        <div className="m-panel-light m-shadow p-7 sm:p-10 space-y-6">
          <h2 className="m-text-3 text-[#121315] break-words">
            Welcome, {displayName}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 border-t border-[#cdd0d4]">
            <div>
              <p className="m-text-6 text-[#4d5158]">Email</p>
              <p className="m-text font-medium text-[#121315] mt-1 break-all">{displayEmail}</p>
            </div>
            <div>
              <p className="m-text-6 text-[#4d5158]">Student ID</p>
              <p className="m-text font-medium text-[#121315] mt-1 tabular-nums">{displayStudentId}</p>
            </div>
            <div>
              <p className="m-text-6 text-[#4d5158]">Year Level</p>
              <p className="m-text font-medium text-[#121315] mt-1">{displayYearLevel}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PORTAL_CARDS.map((item) => (
            <div key={item.title} className="m-surface flex flex-col justify-between gap-5">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#e7e8ea] m-text-4 text-[#121315]">
                  {item.num}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#121315] text-[#FFD100] text-xs font-medium shrink-0">
                  {item.badge}
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="m-text-5 text-[#121315]">{item.title}</h3>
                <p className="m-text-6 text-[#4d5158]">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
