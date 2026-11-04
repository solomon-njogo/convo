import { useCallback, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import { loginUser, logoutUser, registerUser } from '../services/authService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authActionError, setAuthActionError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setError(null)
      if (!nextUser) setAuthActionError(null)
      setLoading(false)
    }, (authError) => {
      setError(authError.message)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = useCallback(async (credentials) => {
    setAuthActionError(null)
    try {
      return await loginUser(credentials)
    } catch (actionError) {
      setAuthActionError(actionError)
      throw actionError
    }
  }, [])

  const register = useCallback(async (userDetails) => {
    setAuthActionError(null)
    try {
      return await registerUser(userDetails)
    } catch (actionError) {
      setAuthActionError(actionError)
      throw actionError
    }
  }, [])

  const signOut = useCallback(async () => {
    await logoutUser()
    setAuthActionError(null)
  }, [])

  const value = useMemo(() => ({
    user,
    currentUser: user,
    loading,
    error,
    authActionError,
    login,
    register,
    signOut,
  }), [user, loading, error, authActionError, login, register, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
