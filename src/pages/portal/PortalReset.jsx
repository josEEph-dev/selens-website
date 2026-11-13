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
    <div className="bg-selens-black text-selens-white min-h-[75vh]">
      <PageHeader
        title="Set New Password"
        description="Choose a new password for your SELENS account."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex justify-center">
        <Card hover={false} className="max-w-md w-full p-6 sm:p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="h-8 w-8 animate-spin rounded-[4px] border-2 border-selens-line border-t-selens-yellow" />
              <p className="text-sm font-sans text-neutral-300">Verifying recovery link...</p>
            </div>
          ) : !canReset ? (
            <div className="space-y-4">
              <div className="rounded-[4px] border border-selens-yellow bg-selens-black px-4 py-4 text-sm font-sans text-selens-yellow leading-relaxed">
                This password reset link is invalid or has expired. Request a new reset link to continue.
              </div>
              <Link
                to="/portal/forgot"
                className="inline-flex items-center justify-center rounded-[4px] bg-selens-yellow px-4 py-2.5 text-sm font-sans font-semibold text-selens-black hover:bg-selens-yellow/90 transition"
              >
                Request reset link
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div
                  role="alert"
                  className="rounded-[4px] border border-selens-yellow bg-selens-black px-4 py-3 text-sm font-sans text-selens-yellow"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="reset-password" className="block text-sm font-sans font-medium text-selens-white mb-1.5">
                    New Password
                  </label>
                  <input
                    id="reset-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-[4px] border border-selens-line bg-selens-black px-3.5 py-2.5 text-sm font-sans text-selens-white placeholder:text-neutral-500 focus:border-selens-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reset-confirm-password" className="block text-sm font-sans font-medium text-selens-white mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full rounded-[4px] border border-selens-line bg-selens-black px-3.5 py-2.5 text-sm font-sans text-selens-white placeholder:text-neutral-500 focus:border-selens-yellow focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-[4px] bg-selens-yellow px-4 py-2.5 text-sm font-sans font-semibold text-selens-black hover:bg-selens-yellow/90 disabled:opacity-50 transition cursor-pointer"
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
