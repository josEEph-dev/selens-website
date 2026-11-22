import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { PageHeader, Card } from '../../components/SharedUI'
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
        eyebrow="Student Portal"
        title="Reset Password"
        description="Request a password reset link for your SELENS account."
      />

      <div className="selens-container py-12 sm:py-16 flex justify-center">
        <Card hover={false} className="max-w-md w-full p-6 sm:p-8 space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-[3px] border border-red-300 bg-red-50 px-4 py-3 text-sm font-sans text-red-800 leading-relaxed"
            >
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-[3px] border-l-4 border-selens-yellow bg-selens-paper-alt px-4 py-4 text-sm font-sans text-selens-paper-ink leading-relaxed">
                If that email has an account, a reset link was sent.
              </div>
              <Link to="/portal/signin" className="selens-btn-paper-outline">
                Back to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-sans font-semibold text-selens-paper-ink mb-1.5">
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
                  className="selens-input font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="selens-btn-ink w-full disabled:opacity-50"
              >
                {submitting ? 'Sending link...' : 'Send reset link'}
              </button>

              <p className="text-center text-sm font-sans text-selens-paper-muted pt-1">
                <Link
                  to="/portal/signin"
                  className="text-selens-paper-ink underline decoration-selens-yellow decoration-2 underline-offset-4 font-semibold"
                >
                  Back to Sign in
                </Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
