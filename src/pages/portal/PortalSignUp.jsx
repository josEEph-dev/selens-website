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

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 flex justify-center">
        <Card hover={false} className="max-w-lg w-full p-6 sm:p-8 space-y-6">
          {error && (
            <div
              role="alert"
              className="rounded-[4px] border border-selens-yellow bg-selens-black px-4 py-3 text-sm font-sans text-selens-yellow"
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
                className="inline-flex items-center justify-center rounded-[4px] bg-selens-yellow px-4 py-2.5 text-sm font-sans font-semibold text-selens-black hover:bg-selens-yellow/90 transition"
              >
                Go to Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="signup-full-name" className="block text-sm font-sans font-medium text-selens-white mb-1.5">
                  Full Name
                </label>
                <input
                  id="signup-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full rounded-[4px] border border-selens-line bg-selens-black px-3.5 py-2.5 text-sm font-sans text-selens-white placeholder:text-neutral-500 focus:border-selens-yellow focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-sans font-medium text-selens-white mb-1.5">
                  School Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@msugensan.edu.ph"
                  className="w-full rounded-[4px] border border-selens-line bg-selens-black px-3.5 py-2.5 text-sm font-sans text-selens-white placeholder:text-neutral-500 focus:border-selens-yellow focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-student-id" className="block text-sm font-sans font-medium text-selens-white mb-1.5">
                    Student ID
                  </label>
                  <input
                    id="signup-student-id"
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="2023-2774"
                    className="w-full rounded-[4px] border border-selens-line bg-selens-black px-3.5 py-2.5 text-sm font-sans text-selens-white placeholder:text-neutral-500 focus:border-selens-yellow focus:outline-none"
                  />
                  <p className="mt-1 text-xs font-sans text-neutral-400">Example: 2023-2774</p>
                </div>

                <div>
                  <label htmlFor="signup-year-level" className="block text-sm font-sans font-medium text-selens-white mb-1.5">
                    Year Level
                  </label>
                  <select
                    id="signup-year-level"
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="w-full rounded-[4px] border border-selens-line bg-selens-black px-3.5 py-2.5 text-sm font-sans text-selens-white focus:border-selens-yellow focus:outline-none"
                  >
                    {YEAR_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-sans font-medium text-selens-white mb-1.5">
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
                  className="w-full rounded-[4px] border border-selens-line bg-selens-black px-3.5 py-2.5 text-sm font-sans text-selens-white placeholder:text-neutral-500 focus:border-selens-yellow focus:outline-none"
                />
              </div>

              <label className="flex items-start gap-3 text-xs sm:text-sm font-sans text-neutral-300 leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-[2px] border border-selens-line bg-selens-black accent-selens-yellow"
                />
                <span>
                  I agree that SELENS may use my name, school email, student ID, and year level to run student services. {'Questions about your data? Contact SELENS at iieeasteeg@msugensan.edu.ph or through facebook at https://www.facebook.com/selensmsugsc.'}
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-[4px] bg-selens-yellow px-4 py-2.5 text-sm font-sans font-semibold text-selens-black hover:bg-selens-yellow/90 disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? 'Creating account...' : 'Create account'}
              </button>

              <p className="text-center text-sm font-sans text-neutral-300">
                Already have an account?{' '}
                <Link to="/portal/signin" className="text-selens-yellow hover:underline font-medium">
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
