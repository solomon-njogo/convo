import { createContext, useContext } from 'react'

/**
 * UI contract consumed by the auth forms and signed-in navigation.
 */
export const AuthContext = createContext(null)

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used within an AuthContext.Provider')
  }
  return value
}
