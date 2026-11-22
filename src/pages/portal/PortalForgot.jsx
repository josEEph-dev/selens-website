import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { PageHeader } from '../../components/SharedUI'
import { useNoIndex } from './useNoIndex'

export default function PortalForgot() {
  useNoIndex()
  const { sendPasswordReset } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setError('Enter your email address.')
      return
    }

    setSubmitting(true)
    try {
      await sendPasswordReset(cleanEmail)
    } catch {
      // Intentionally show the same confirmation message to avoid revealing account existence
    } finally {
      setSubmitting(false)
      setSubmitted(true)
    }
  }

  return (
    <div id="main-content" className="selens-paper-page min-h-[75vh]">
      <PageHeader
        title="Reset Password"
        description="Request a password reset link for your SELENS account."
      />

      <div className="selens-container py-12 sm:py-16 flex justify-center">
        <div className="m-panel-light m-shadow max-w-md w-full p-7 sm:p-9 space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 m-text-6 text-red-800"
            >
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-5">
              <div className="rounded-[14px] border-l-4 border-[#FFD100] bg-[#e7e8ea] px-4 py-4 m-text-6 text-[#121315]">
                If that email has an account, a reset link was sent.
              </div>
              <Link to="/portal/signin" className="m-btn-2 m-btn-2--mist">
                <span className="m-btn-2__label">Back to Sign in</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="m-field">
                <label htmlFor="forgot-email" className="m-field__label">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  aria-invalid={Boolean(error)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@msugensan.edu.ph"
                  className="m-field__control"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="m-btn w-full"
              >
                <span className="m-btn__label">
                  {submitting ? 'Sending link...' : 'Send reset link'}
                </span>
              </button>

              <p className="text-center m-text-6 text-[#4d5158] pt-1">
                <Link
                  to="/portal/signin"
                  className="m-link text-[#121315] font-medium"
                >
                  Back to Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
