import { createContext } from 'react'

export const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  isOfficer: false,
  isAdmin: false,
  signIn: async () => {},
  signInWithDemoRole: () => {},
  signOut: async () => {},
})
