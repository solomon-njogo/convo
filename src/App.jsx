import { useState } from 'react'
import Navbar from './components/Navbar'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import { mapAuthError } from './utils/authErrors'
import './App.css'

function AppContent() {
  const { user, loading, error, authActionError } = useAuth()
  const [authView, setAuthView] = useState('login')
  const [mainView, setMainView] = useState('chat')
  const [profileUserId, setProfileUserId] = useState(null)

  function openOwnProfile() {
    if (!user?.uid) return
    setProfileUserId(user.uid)
    setMainView('profile')
  }

  function openPeerProfile(peerId) {
    if (!peerId) return
    setProfileUserId(peerId)
    setMainView('profile')
  }

  function goToChat() {
    setMainView('chat')
    setProfileUserId(null)
  }

  if (loading) {
    return (
      <main className="app-signed-in" aria-busy="true">
        <p className="app-session-status" role="status" aria-live="polite">
          Restoring your session…
        </p>
      </main>
    )
  }

  if (user) {
    return (
      <>
        <Navbar
          onSignedOut={() => {
            setAuthView('login')
            goToChat()
          }}
          onOpenOwnProfile={openOwnProfile}
          onGoToChat={goToChat}
        />
        {mainView === 'profile' ? (
          <main className="app-profile">
            <Profile userId={profileUserId} onBack={goToChat} />
          </main>
        ) : (
          <main className="app-chat">
            {authActionError ? (
              <p className="auth-form-error" role="alert">
                {mapAuthError(authActionError)}
              </p>
            ) : null}
            <Chat onOpenPeerProfile={openPeerProfile} />
          </main>
        )}
      </>
    )
  }

  return (
    <>
      {error ? (
        <p className="auth-form-error" role="alert">
          We couldn’t restore your sign-in. Refresh the page or try signing in
          again.
        </p>
      ) : null}
      {authView === 'register' ? (
        <Register onGoToLogin={() => setAuthView('login')} />
      ) : (
        <Login onGoToRegister={() => setAuthView('register')} />
      )}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
