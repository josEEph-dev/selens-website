import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { PageHeader, Card, PrimaryButton, SecondaryButton } from '../components/SharedUI'
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
    <div className="bg-selens-black text-selens-white min-h-[80vh]">
      <PageHeader
        title="Officer Login"
        description="Sign in with your officer credentials to manage organization content and records."
      />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 flex justify-center">
        <div className="w-full max-w-md space-y-6">
          <Card className="p-6 sm:p-8 space-y-6" hover={false}>
            {user ? (
              <div className="space-y-6 text-center">
                <div className="w-12 h-12 rounded-[4px] bg-selens-black border border-selens-line text-selens-yellow flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-serif font-bold text-xl text-selens-white">
                    Signed in as {profile?.full_name || 'Officer'}
                  </h2>
                  <p className="text-sm text-neutral-300 font-sans">
                    {profile?.email}
                  </p>
                </div>

                <div className="p-4 bg-selens-black border border-selens-line rounded-[4px] space-y-2 text-left text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Role</span>
                    <span className="font-semibold text-selens-yellow capitalize">{profile?.role}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <PrimaryButton
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    Go to Dashboard
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={signOut}
                    className="w-full text-red-400 border-red-500/40 hover:border-red-400 hover:text-red-300"
                  >
                    Sign out
                  </SecondaryButton>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-950/40 border border-red-700/50 rounded-[4px] flex items-start gap-3 text-sm text-red-200">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-selens-white">
                      Officer email address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. officer@msugensan.edu.ph"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-selens-white">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-selens-black border border-selens-line rounded-[4px] text-sm text-selens-white placeholder:text-neutral-500 focus:outline-none focus:border-selens-yellow transition font-sans"
                    />
                  </div>

                  <PrimaryButton
                    type="submit"
                    disabled={loading}
                    className="w-full gap-2 mt-2"
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
