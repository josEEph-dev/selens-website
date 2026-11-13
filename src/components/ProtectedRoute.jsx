import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Card, PrimaryButton, SecondaryButton } from './SharedUI'
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
      <div className="flex min-h-[60vh] items-center justify-center bg-selens-black">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-[4px] border-2 border-selens-line border-t-selens-yellow" />
          <p className="text-sm font-sans text-neutral-300">
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
      <div className="bg-selens-black min-h-[75vh] flex items-center justify-center px-4 py-16">
        <Card className="max-w-md w-full space-y-5 text-center">
          <div className="w-12 h-12 rounded-[4px] bg-selens-black border border-selens-line text-selens-yellow flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-xl font-bold text-selens-white">
              Not authorized
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed font-sans">
              {requireAdmin
                ? 'This section is reserved for authorized SELENS administrators.'
                : 'This dashboard is reserved for authorized SELENS officers and administrators.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <PrimaryButton to="/">
              Return to Home
            </PrimaryButton>
          </div>
        </Card>
      </div>
    )
  }

  return children
}
