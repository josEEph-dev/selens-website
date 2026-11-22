import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { AuthContext } from './authStore'

const isSupabaseConfigured = true

const DEMO_PROFILES = {
  student: {
    id: 'usr-student-1',
    email: 'student@msugensan.edu.ph',
    student_id: '2023-4567',
    full_name: 'Juan Miguel Dela Cruz',
    year_level: '3rd Year',
    role: 'student',
    is_enrolled: true,
    payment_status: 'verified',
  },
  officer: {
    id: 'usr-officer-1',
    email: 'secretary.selens@msugensan.edu.ph',
    student_id: '2022-1089',
    full_name: 'Kyla Nicole A. Santos',
    year_level: '4th Year',
    role: 'officer',
    is_enrolled: true,
    payment_status: 'verified',
  },
  admin: {
    id: 'usr-admin-1',
    email: 'president.selens@msugensan.edu.ph',
    student_id: '2022-0042',
    full_name: 'John Paul B. Alcantara',
    year_level: '4th Year',
    role: 'admin',
    is_enrolled: true,
    payment_status: 'verified',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authEvent, setAuthEvent] = useState(null)

  // Initialize session
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            setUser(session.user)
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            setProfile({
              ...(prof || {
                id: session.user.id,
                role: 'student',
                full_name: session.user.user_metadata?.full_name || 'Member',
                student_id: session.user.user_metadata?.student_id || null,
                year_level: session.user.user_metadata?.year_level || null,
              }),
              email: session.user.email,
            })
          }
        } catch {
          // Session initialization failed; remain signed out
        }
      }
      setLoading(false)
    }

    initAuth()

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setAuthEvent(event)
          if (session?.user) {
            setUser(session.user)
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            setProfile({
              ...(prof || {
                id: session.user.id,
                role: 'student',
                full_name: session.user.user_metadata?.full_name || 'Member',
                student_id: session.user.user_metadata?.student_id || null,
                year_level: session.user.user_metadata?.year_level || null,
              }),
              email: session.user.email,
            })
          } else {
            setUser(null)
            setProfile(null)
          }
          setLoading(false)
        }
      )
      return () => subscription.unsubscribe()
    }
  }, [])

  const signUp = async ({
    email,
    password,
    full_name,
    first_name,
    middle_name,
    surname,
    year_level,
    student_id,
  }) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Authentication service is not configured.')
    }
    const cleanEmail = (email || '').trim().toLowerCase()
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: (full_name || '').trim(),
          first_name: (first_name || '').trim(),
          middle_name: (middle_name || '').trim(),
          surname: (surname || '').trim(),
          year_level,
          student_id: (student_id || '').trim(),
        },
        emailRedirectTo: `${window.location.origin}/portal`,
      },
    })
    if (error) throw error
    return data
  }

  const signIn = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase()
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })
      if (error) throw error
      return data
    }
    if (cleanEmail.includes('president') || cleanEmail.includes('admin')) {
      signInWithDemoRole('admin')
    } else if (cleanEmail.includes('officer') || cleanEmail.includes('secretary') || cleanEmail.includes('selens')) {
      signInWithDemoRole('officer')
    } else {
      signInWithDemoRole('student')
    }
    return { user }
  }

  const signInWithDemoRole = (role) => {
    const prof = DEMO_PROFILES[role] || DEMO_PROFILES.student
    setUser({ id: prof.id, email: prof.email })
    setProfile(prof)
  }

  const sendPasswordReset = async (email) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Authentication service is not configured.')
    }
    const cleanEmail = (email || '').trim().toLowerCase()
    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/portal/reset`,
    })
    if (error) throw error
    return data
  }

  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Authentication service is not configured.')
    }
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
    setAuthEvent(null)
  }

  const isOfficer = ['officer', 'pubrel', 'admin_affairs', 'admin'].includes(profile?.role)
  const isAdmin = ['admin', 'admin_affairs'].includes(profile?.role)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authEvent,
        isOfficer,
        isAdmin,
        signUp,
        signIn,
        signInWithDemoRole,
        sendPasswordReset,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
