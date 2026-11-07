import { useState } from 'react'
import PeerAvatar from './PeerAvatar'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function signedInLabel(user) {
  const name = user?.displayName?.trim()
  if (name) return name
  return user?.email ?? 'Signed in'
}

export default function Navbar({ onSignedOut, onOpenOwnProfile, onGoToChat }) {
  const { user, signOut } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await signOut()
      onSignedOut?.()
    } finally {
      setIsSigningOut(false)
    }
  }

  const identityPeer = {
    displayName: signedInLabel(user),
    photoURL: user?.photoURL ?? null,
  }

  return (
    <header className="app-navbar">
      <button
        type="button"
        className="app-navbar-brand"
        onClick={() => onGoToChat?.()}
      >
        Convo
      </button>
      <div className="app-navbar-end">
        <button
          type="button"
          className="app-navbar-identity"
          onClick={() => onOpenOwnProfile?.()}
          title={user?.email ?? undefined}
          aria-label={`Open your profile (${signedInLabel(user)})`}
        >
          <PeerAvatar peer={identityPeer} size="small" />
          <span className="app-navbar-identity__label">{signedInLabel(user)}</span>
        </button>
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
