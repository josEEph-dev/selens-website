import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { PageHeader, Card } from '../../components/SharedUI'
import { useNoIndex } from './useNoIndex'

export default function PortalSignIn() {
  useNoIndex()
  const { user, loading, signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/portal" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      setError('Enter your email and password.')
      return
    }

    setSubmitting(true)
    try {
      await signIn(cleanEmail, password)
      navigate('/portal', { replace: true })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div id="main-content" className="selens-paper-page min-h-[75vh]">
      <PageHeader
        eyebrow="Student Portal"
        title="Sign In"
        description="Sign in to your SELENS account."
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

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="signin-email" className="block text-sm font-sans font-semibold text-selens-paper-ink mb-1.5">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                required
                aria-invalid={Boolean(error)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="selens-input font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <label htmlFor="signin-password" className="block text-sm font-sans font-semibold text-selens-paper-ink">
                  Password
                </label>
                <Link
                  to="/portal/forgot"
                  className="text-xs font-sans font-semibold text-selens-paper-ink underline decoration-selens-yellow decoration-2 underline-offset-4 hover:text-selens-paper-muted"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="signin-password"
                type="password"
                required
                aria-invalid={Boolean(error)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="selens-input font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="selens-btn-ink w-full disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-sm font-sans text-selens-paper-muted pt-1">
              Need a student account?{' '}
              <Link
                to="/portal/signup"
                className="text-selens-paper-ink underline decoration-selens-yellow decoration-2 underline-offset-4 font-semibold"
              >
                Create account
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
