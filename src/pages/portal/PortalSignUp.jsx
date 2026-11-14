import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'
import { PageHeader, Card } from '../../components/SharedUI'
import { useNoIndex } from './useNoIndex'

const SCHOOL_EMAIL_REGEX = /^[^@\s]+@msugensan\.edu\.ph$/i
const STUDENT_ID_REGEX = /^\d{4}-\d{4}$/
const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other']

export default function PortalSignUp() {
  useNoIndex()
  const { user, loading, signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [studentId, setStudentId] = useState('')
  const [yearLevel, setYearLevel] = useState('1st Year')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/portal" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setConfirmationMessage('')

    const cleanName = fullName.trim()
    const cleanEmail = email.trim().toLowerCase()
    const cleanStudentId = studentId.trim()

    if (!cleanName) {
      setError('Enter your full name.')
      return
    }
    if (!SCHOOL_EMAIL_REGEX.test(cleanEmail)) {
      setError('Use your @msugensan.edu.ph email.')
      return
    }
    if (!STUDENT_ID_REGEX.test(cleanStudentId)) {
      setError('Enter your student ID like 2023-2774.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!agreed) {
      setError('You must agree to the student services privacy notice before creating an account.')
      return
    }

    setSubmitting(true)
    try {
      const data = await signUp({
        email: cleanEmail,
        password,
        full_name: cleanName,
        year_level: yearLevel,
        student_id: cleanStudentId,
      })

      if (data?.session) {
        navigate('/portal', { replace: true })
      } else {
        setConfirmationMessage(
          'Check your @msugensan.edu.ph inbox to confirm your account. If you do not see it, check your spam folder.'
        )
      }
    } catch {
      setError('We could not create your account. Check your details or contact SELENS.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-selens-black text-selens-white min-h-[75vh]">
      <PageHeader
        title="Create Student Account"
        description="Register with your official MSU-General Santos email and student ID."
      />

      <div className="selens-container py-12 sm:py-16 flex justify-center">
        <Card hover={false} className="max-w-lg w-full p-6 sm:p-8 space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-[4px] border border-red-500/60 bg-red-950/30 px-4 py-3 text-sm font-sans text-red-200 leading-relaxed"
            >
              {error}
            </div>
          )}

          {confirmationMessage ? (
            <div className="space-y-4">
              <div className="rounded-[4px] border border-selens-yellow bg-selens-black px-4 py-4 text-sm font-sans text-selens-yellow leading-relaxed">
                {confirmationMessage}
              </div>
              <Link
                to="/portal/signin"
                className="min-h-[44px] inline-flex items-center justify-center rounded-[4px] bg-selens-yellow px-5 py-2.5 text-sm font-sans font-bold text-selens-black hover:bg-selens-white transition-colors"
              >
                Go to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="signup-full-name" className="block text-sm font-sans font-semibold text-selens-white mb-1.5">
                  Full Name
                </label>
                <input
                  id="signup-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="selens-input font-sans"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-sans font-semibold text-selens-white mb-1.5">
                  School Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@msugensan.edu.ph"
                  className="selens-input font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-student-id" className="block text-sm font-sans font-semibold text-selens-white mb-1.5">
                    Student ID
                  </label>
                  <input
                    id="signup-student-id"
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="2023-2774"
                    className="selens-input font-sans"
                  />
                  <p className="mt-1 text-xs font-sans text-neutral-400">Example: 2023-2774</p>
                </div>

                <div>
                  <label htmlFor="signup-year-level" className="block text-sm font-sans font-semibold text-selens-white mb-1.5">
                    Year Level
                  </label>
                  <select
                    id="signup-year-level"
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="selens-input font-sans cursor-pointer"
                  >
                    {YEAR_LEVELS.map((level) => (
                      <option key={level} value={level} className="bg-selens-ink text-selens-white">
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-sans font-semibold text-selens-white mb-1.5">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="selens-input font-sans"
                />
              </div>

              <label className="flex items-start gap-3 text-xs sm:text-sm font-sans text-neutral-300 leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded-[2px] border border-selens-line bg-selens-black accent-selens-yellow"
                />
                <span className="break-words">
                  I agree that SELENS may use my name, school email, student ID, and year level to run student services. {'Questions about your data? Contact SELENS at iieeasteeg@msugensan.edu.ph or through facebook at https://www.facebook.com/selensmsugsc.'}
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[44px] rounded-[4px] bg-selens-yellow px-4 py-2.5 text-sm font-sans font-bold text-selens-black hover:bg-selens-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                {submitting ? 'Creating account...' : 'Create account'}
              </button>

              <p className="text-center text-sm font-sans text-neutral-300 pt-1">
                Already have an account?{' '}
                <Link to="/portal/signin" className="text-selens-yellow hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
