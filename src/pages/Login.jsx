import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { PageHeader, Card, PrimaryButton } from '../components/SharedUI'
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
        eyebrow="Administration"
        title="Officer Login"
        description="Sign in with your officer credentials to manage organization content and records."
      />

      <div className="selens-container py-12 sm:py-16 flex justify-center">
        <div className="w-full max-w-md space-y-6">
          <Card className="p-6 sm:p-8 space-y-6" hover={false}>
            {user ? (
              <div className="space-y-6 text-center">
                <div className="w-12 h-12 rounded-[3px] bg-selens-paper-ink text-selens-yellow flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-serif font-bold text-xl text-selens-paper-ink">
                    Signed in as {profile?.full_name || 'Officer'}
                  </h2>
                  <p className="text-sm text-selens-paper-muted font-sans break-all">
                    {profile?.email}
                  </p>
                </div>

                <div className="p-4 bg-selens-paper-alt border border-selens-paper-rule rounded-[3px] space-y-2 text-left text-sm">
                  <div className="flex justify-between">
                    <span className="text-selens-paper-muted">Role</span>
                    <span className="font-bold text-selens-paper-ink capitalize">{profile?.role}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <PrimaryButton
                    onClick={() => navigate('/dashboard')}
                    className="w-full min-h-[44px]"
                  >
                    Go to Dashboard
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full min-h-[44px] rounded-[3px] border border-red-300 bg-red-50 text-red-700 font-semibold text-sm hover:bg-red-100 transition-colors cursor-pointer"
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
                    className="p-4 bg-red-50 border border-red-300 rounded-[3px] flex items-start gap-3 text-sm text-red-800 leading-relaxed"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="officer-email" className="block text-sm font-semibold text-selens-paper-ink">
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
                      className="selens-input font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="officer-password" className="block text-sm font-semibold text-selens-paper-ink">
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
                      className="selens-input font-sans"
                    />
                  </div>

                  <PrimaryButton
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[44px] gap-2 mt-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                  </PrimaryButton>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
