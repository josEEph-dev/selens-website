import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ShieldAlert } from 'lucide-react'

/**
 * Route protection gatekeeper:
 * - requireAuth: user must be logged in (student, officer, or admin)
 * - requireOfficer: user must have role 'officer' or 'admin'
 */
export default function ProtectedRoute({ children, requireAuth = true, requireOfficer = false, requireAdmin = false }) {
  const { user, loading, isOfficer, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="selens-paper-page flex min-h-[70vh] items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#cdd0d4] border-t-[#121315]" />
          <p className="m-text-6 text-[#4d5158]">
            Checking authorization...
          </p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if ((requireOfficer && !isOfficer) || (requireAdmin && !isAdmin)) {
    return (
      <div className="selens-paper-page min-h-[75vh] flex items-center justify-center px-4 pt-28 pb-16">
        <div className="m-panel-light m-shadow max-w-md w-full p-8 sm:p-10 space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-[#121315] text-[#FFD100] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="m-text-5 text-[#121315]">
              Not authorized
            </h2>
            <p className="m-text-6 text-[#4d5158]">
              {requireAdmin
                ? 'This section is reserved for authorized SELENS administrators.'
                : 'This dashboard is reserved for authorized SELENS officers and administrators.'}
            </p>
          </div>
          <div className="pt-2">
            <Link to="/" className="m-btn">
              <span className="m-btn__label">Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}
