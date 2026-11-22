import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { PageHeader } from '../../components/SharedUI'
import { useNoIndex } from './useNoIndex'

export default function PortalReset() {
  useNoIndex()
  const { user, loading, authEvent, updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
        title="Set New Password"
        description="Choose a new password for your SELENS account."
      />

      <div className="selens-container py-12 sm:py-16 flex justify-center">
        <div className="m-panel-light m-shadow max-w-md w-full p-7 sm:p-9 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#cdd0d4] border-t-[#121315]" />
              <p className="m-text-6 text-[#4d5158]">Verifying recovery link...</p>
            </div>
          ) : !canReset ? (
            <div className="space-y-5">
              <div className="rounded-[14px] border-l-4 border-[#FFD100] bg-[#e7e8ea] px-4 py-4 m-text-6 text-[#121315]">
                This password reset link is invalid or has expired. Request a new reset link to continue.
              </div>
              <Link to="/portal/forgot" className="m-btn">
                <span className="m-btn__label">Request reset link</span>
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div
                  role="alert"
                  className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 m-text-6 text-red-800"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="m-field">
                  <label htmlFor="reset-password" className="m-field__label">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      aria-invalid={Boolean(error)}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="m-field__control !pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide new password' : 'Show new password'}
                      aria-pressed={showPassword}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:text-[#121315] hover:bg-[#cdd0d4]/60 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                <div className="m-field">
                  <label htmlFor="reset-confirm-password" className="m-field__label">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      aria-invalid={Boolean(error)}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="m-field__control !pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      aria-pressed={showConfirmPassword}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4d5158] hover:text-[#121315] hover:bg-[#cdd0d4]/60 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="m-btn w-full"
                >
                  <span className="m-btn__label">
                    {submitting ? 'Updating password...' : 'Update password'}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
