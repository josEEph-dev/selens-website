import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { PageHeader } from '../components/SharedUI'
import { LogIn, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'robots'
      document.head.appendChild(meta)
    }
    meta.content = 'noindex, nofollow'
    return () => {
      if (meta) meta.content = 'index, follow'
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div id="main-content" className="selens-paper-page min-h-[80vh]">
      <PageHeader
        title="Officer Login"
        description="Sign in with your officer credentials to manage organization content and records."
      />

      <div className="selens-container py-12 sm:py-16 flex justify-center">
        <div className="w-full max-w-md">
          <div className="m-panel-light m-shadow p-7 sm:p-9 space-y-6">
            {user ? (
              <div className="space-y-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#121315] text-[#FFD100] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="m-text-5 text-[#121315]">
                    Signed in as {profile?.full_name || 'Officer'}
                  </h2>
                  <p className="m-text-6 text-[#4d5158] break-all">
                    {profile?.email}
                  </p>
                </div>

                <div className="p-4 bg-[#e7e8ea] rounded-[14px] space-y-2 text-left m-text-6">
                  <div className="flex justify-between">
                    <span className="text-[#4d5158]">Role</span>
                    <span className="font-medium text-[#121315] capitalize">{profile?.role}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="m-btn w-full"
                  >
                    <span className="m-btn__label">Go to Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={signOut}
                    className="min-h-[44px] w-full rounded-full border border-red-300 bg-red-50 text-red-700 font-medium text-sm hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {error && (
                  <div
                    role="alert"
                    className="p-4 bg-red-50 border border-red-200 rounded-[14px] flex items-start gap-3 m-text-6 text-red-800"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="m-field">
                    <label htmlFor="officer-email" className="m-field__label">
                      Officer email address
                    </label>
                    <input
                      id="officer-email"
                      type="email"
                      required
                      aria-invalid={Boolean(error)}
                      placeholder="e.g. officer@msugensan.edu.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="m-field__control"
                    />
                  </div>

                  <div className="m-field">
                    <label htmlFor="officer-password" className="m-field__label">
                      Password
                    </label>
                    <input
                      id="officer-password"
                      type="password"
                      required
                      aria-invalid={Boolean(error)}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="m-field__control"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="m-btn w-full mt-2"
                  >
                    <span className="m-btn__label">
                      <LogIn className="w-4 h-4" />
                      <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                    </span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
