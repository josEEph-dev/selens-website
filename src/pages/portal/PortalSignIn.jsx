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
    <div className="bg-selens-black text-selens-white min-h-[75vh]">
      <PageHeader
        title="Sign In"
        description="Sign in to your SELENS account."
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

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="signin-email" className="block text-sm font-sans font-semibold text-selens-white mb-1.5">
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
                <label htmlFor="signin-password" className="block text-sm font-sans font-semibold text-selens-white">
                  Password
                </label>
                <Link to="/portal/forgot" className="text-xs font-sans font-medium text-selens-yellow hover:underline">
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
              className="w-full min-h-[44px] rounded-[4px] bg-selens-yellow px-4 py-2.5 text-sm font-sans font-bold text-selens-black hover:bg-selens-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>

            <p className="text-center text-sm font-sans text-neutral-300 pt-1">
              Need a student account?{' '}
              <Link to="/portal/signup" className="text-selens-yellow hover:underline font-semibold">
                Create account
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  )
}
