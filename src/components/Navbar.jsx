import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function signedInLabel(user) {
  const name = user?.displayName?.trim()
  if (name) return name
  return user?.email ?? 'Signed in'
}

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="app-navbar">
      <p className="app-navbar-brand">Convo</p>
      <div className="app-navbar-end">
        <span className="app-navbar-identity" title={user?.email ?? undefined}>
          {signedInLabel(user)}
        </span>
        <button
          type="button"
          className="btn btn--secondary app-navbar-signout"
          onClick={handleSignOut}
          disabled={isSigningOut}
          aria-busy={isSigningOut}
        >
          {isSigningOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </header>
  )
}
