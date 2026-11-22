import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { PageHeader } from '../../components/SharedUI'
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
        title="Sign In"
        description="Sign in to your SELENS account."
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

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="m-field">
              <label htmlFor="signin-email" className="m-field__label">
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
                className="m-field__control"
              />
            </div>

            <div className="m-field">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="signin-password" className="m-field__label">
                  Password
                </label>
                <Link
                  to="/portal/forgot"
                  className="m-link text-xs font-medium text-[#121315]"
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
                className="m-field__control"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="m-btn w-full"
            >
              <span className="m-btn__label">
                {submitting ? 'Signing in...' : 'Sign in'}
              </span>
            </button>

            <p className="text-center m-text-6 text-[#4d5158] pt-1">
              Need a student account?{' '}
              <Link
                to="/portal/signup"
                className="m-link text-[#121315] font-medium"
              >
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
