import { useState } from 'react'
import Navbar from './components/Navbar'
import Chat from './pages/Chat'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function AppContent() {
  const { user, loading, error } = useAuth()
  const [authView, setAuthView] = useState('login')

  if (loading) {
    return (
      <main className="app-signed-in" aria-busy="true">
        <p>Restoring your session…</p>
      </main>
    )
  }

  if (user) {
    return (
      <>
        <Navbar onSignedOut={() => setAuthView('login')} />
        <main className="app-chat">
          <Chat />
        </main>
      </>
    )
  }

  return (
    <>
      {error ? (
        <p className="auth-form-error" role="alert">
          Could not restore your sign-in session. Please try again.
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
