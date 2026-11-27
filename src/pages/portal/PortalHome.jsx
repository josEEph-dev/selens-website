import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { buildPortalCards } from '../../lib/portalApps'
import { PageHeader } from '../../components/SharedUI'
import { ArrowUpRight } from 'lucide-react'

function PortalCardContent({ item }) {
  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#e7e8ea] m-text-4 text-[#121315] tabular-nums">
            {item.num}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
              item.isLive
                ? 'bg-[#FFD100] text-[#121315]'
                : 'bg-[#121315] text-[#FFD100]'
            }`}
          >
            {item.badge}
          </span>
        </div>
        <div className="space-y-1.5">
          <h3
            className={`m-text-5 text-[#121315] break-words ${
              item.isLive ? 'group-hover:underline underline-offset-4' : ''
            }`}
          >
            {item.title}
          </h3>
          {item.description && (
            <p className="m-text-6 text-[#4d5158]">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {item.isLive && (
        <div className="pt-3.5 border-t border-[#cdd0d4] flex items-center justify-between gap-3 m-text-4 text-[#121315]">
          <span>Open app</span>
          <span className="w-8 h-8 rounded-full bg-[#121315] text-[#FFD100] inline-flex items-center justify-center group-hover:bg-[#FFD100] group-hover:text-[#121315] transition-colors shrink-0">
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </div>
      )}
    </>
  )
}

export default function PortalHome() {
  const { user, profile, loading, isOfficer, signOut } = useAuth()
  const [studentProfile, setStudentProfile] = useState(null)
  const [portalProjects, setPortalProjects] = useState([])
  const [loadingApps, setLoadingApps] = useState(true)

  useEffect(() => {
    let active = true
    async function loadPortalData() {
      if (!user?.id || !isSupabaseConfigured || !supabase) {
        if (active) setLoadingApps(false)
        return
      }
      setLoadingApps(true)
      try {
        const [{ data: profileData }, { data: projectsData, error: projectsError }] =
          await Promise.all([
            supabase
              .from('profiles')
              .select('full_name, student_id, year_level, role')
              .eq('id', user.id)
              .single(),
            supabase
              .from('projects')
              .select('id, name, description, status, link_url, show_in_portal, portal_order, created_at')
              .eq('show_in_portal', true)
              .order('portal_order', { ascending: true })
              .order('created_at', { ascending: true }),
          ])

        if (active && profileData) {
          setStudentProfile(profileData)
        }
        if (active) {
          if (projectsError) {
            console.error('[PortalHome] Error fetching portal apps:', projectsError)
            setPortalProjects([])
          } else {
            setPortalProjects(projectsData || [])
          }
        }
      } catch (err) {
        console.error('[PortalHome] Failed to load portal data:', err)
      } finally {
        if (active) setLoadingApps(false)
      }
    }
    loadPortalData()
    return () => {
      active = false
    }
  }, [user?.id])

  const portalCards = useMemo(
    () => buildPortalCards(portalProjects),
    [portalProjects]
  )

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

        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="m-text-5 text-[#121315]">Services &amp; apps</h3>
              <p className="m-text-6 text-[#4d5158]">
                Launch available SELENS tools and student project portals.
              </p>
            </div>
            {isOfficer && (
              <Link to="/dashboard/projects" className="m-link m-text-4 text-[#121315]">
                <span>Manage portal apps</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>

          {loadingApps ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-44 bg-white rounded-[20px] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portalCards.map((item) => {
                if (item.isLive && item.external) {
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="m-surface no-underline flex flex-col justify-between gap-5 group transition-shadow hover:shadow-[0_22px_44px_-24px_rgba(18,19,21,0.45)]"
                    >
                      <PortalCardContent item={item} />
                    </a>
                  )
                }

                if (item.isLive && !item.external) {
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className="m-surface no-underline flex flex-col justify-between gap-5 group transition-shadow hover:shadow-[0_22px_44px_-24px_rgba(18,19,21,0.45)]"
                    >
                      <PortalCardContent item={item} />
                    </Link>
                  )
                }

                return (
                  <div
                    key={item.id}
                    className="m-surface flex flex-col justify-between gap-5"
                  >
                    <PortalCardContent item={item} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
