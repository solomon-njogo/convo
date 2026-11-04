import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'
import { loginUser, logoutUser, registerUser } from '../services/authService'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setError(null)
      setLoading(false)
    }, (authError) => {
      setError(authError.message)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo(() => ({
    user,
    currentUser: user,
    loading,
    error,
    login: loginUser,
    register: registerUser,
    signOut: logoutUser,
  }), [user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
