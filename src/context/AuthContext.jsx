import { createContext, useContext } from 'react'

/**
 * Seam for the auth/routing owner.
 * Person A UI consumes: login, register, signOut,
 * user { uid, displayName, email } (uid matches users/{userId}).
 */
export const AuthContext = createContext(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used within an AuthContext.Provider')
  }
  return value
}
