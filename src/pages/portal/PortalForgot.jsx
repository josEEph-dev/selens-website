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
    <div className="bg-selens-black text-selens-white min-h-[75vh]">
      <PageHeader
        title="Reset Password"
        description="Request a password reset link for your SELENS account."
      />

      <div className="selens-container py-12 sm:py-16 flex justify-center">
        <Card hover={false} className="max-w-md w-full p-6 sm:p-8 space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-[4px] border border-red-500/60 bg-red-950/30 px-4 py-3 text-sm font-sans text-red-200 leading-relaxed"
            >
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-[4px] border border-selens-yellow bg-selens-black px-4 py-4 text-sm font-sans text-selens-yellow leading-relaxed">
                If that email has an account, a reset link was sent.
              </div>
              <Link
                to="/portal/signin"
                className="min-h-[44px] inline-flex items-center justify-center rounded-[4px] border border-selens-line bg-selens-black px-4 py-2 text-sm font-sans font-semibold text-selens-white hover:border-selens-yellow hover:text-selens-yellow transition-colors"
              >
                Back to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-sans font-semibold text-selens-white mb-1.5">
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
                className="w-full min-h-[44px] rounded-[4px] bg-selens-yellow px-4 py-2.5 text-sm font-sans font-bold text-selens-black hover:bg-selens-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? 'Sending link...' : 'Send reset link'}
              </button>

              <p className="text-center text-sm font-sans text-neutral-300 pt-1">
                <Link to="/portal/signin" className="text-selens-yellow hover:underline font-semibold">
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
