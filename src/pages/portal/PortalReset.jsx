import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { PageHeader, Card } from '../../components/SharedUI'
import { useNoIndex } from './useNoIndex'

export default function PortalReset() {
  useNoIndex()
  const { user, loading, authEvent, updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canReset = authEvent === 'PASSWORD_RECOVERY' || Boolean(user)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await updatePassword(password)
      navigate('/portal', { replace: true })
    } catch {
      setError('We could not update your password. Request a new reset link and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div id="main-content" className="selens-paper-page min-h-[75vh]">
      <PageHeader
        eyebrow="Student Portal"
        title="Set New Password"
        description="Choose a new password for your SELENS account."
      />

      <div className="selens-container py-12 sm:py-16 flex justify-center">
        <Card hover={false} className="max-w-md w-full p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="h-8 w-8 animate-spin rounded-[3px] border-2 border-selens-paper-rule border-t-selens-paper-ink" />
              <p className="text-sm font-sans text-selens-paper-muted">Verifying recovery link...</p>
            </div>
          ) : !canReset ? (
            <div className="space-y-4">
              <div className="rounded-[3px] border-l-4 border-selens-yellow bg-selens-paper-alt px-4 py-4 text-sm font-sans text-selens-paper-ink leading-relaxed">
                This password reset link is invalid or has expired. Request a new reset link to continue.
              </div>
              <Link to="/portal/forgot" className="selens-btn-ink">
                Request reset link
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div
                  role="alert"
                  className="rounded-[3px] border border-red-300 bg-red-50 px-4 py-3 text-sm font-sans text-red-800 leading-relaxed"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="reset-password" className="block text-sm font-sans font-semibold text-selens-paper-ink mb-1.5">
                    New Password
                  </label>
                  <input
                    id="reset-password"
                    type="password"
                    required
                    minLength={8}
                    aria-invalid={Boolean(error)}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="selens-input font-sans"
                  />
                </div>

                <div>
                  <label htmlFor="reset-confirm-password" className="block text-sm font-sans font-semibold text-selens-paper-ink mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    required
                    minLength={8}
                    aria-invalid={Boolean(error)}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="selens-input font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="selens-btn-ink w-full disabled:opacity-50"
                >
                  {submitting ? 'Updating password...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
