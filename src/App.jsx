import { useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import { AuthContext } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

/**
 * Temporary demo wiring so Person A UI can run before Firebase auth plumbing lands.
 * Auth/routing owner: replace this Provider value with real AuthProvider + route gate.
 */
const DEMO_USERS_KEY = 'convo-demo-users'

function readDemoUsers() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
}

function App() {
  const [user, setUser] = useState(null)
  const [authView, setAuthView] = useState('login')

  const auth = useMemo(
    () => ({
      user,
      async login({ email, password }) {
        await delay(450)
        const users = readDemoUsers()
        const record = users[email.toLowerCase()]
        if (!record || record.password !== password) {
          const error = new Error('Incorrect email or password')
          error.code = 'auth/invalid-credential'
          throw error
        }
        setUser({ displayName: record.displayName, email: record.email })
      },
      async register({ displayName, email, password }) {
        await delay(450)
        const key = email.toLowerCase()
        const users = readDemoUsers()
        if (users[key]) {
          const error = new Error('This email is already registered')
          error.code = 'auth/email-already-in-use'
          throw error
        }
        users[key] = { displayName, email, password }
        writeDemoUsers(users)
        setUser({ displayName, email })
      },
      async signOut() {
        await delay(200)
        setUser(null)
        setAuthView('login')
      },
    }),
    [user],
  )

  return (
    <AuthContext.Provider value={auth}>
      {user ? (
        <>
          <Navbar />
          <main className="app-signed-in">
            <h1>You&apos;re signed in</h1>
            <p>Chat UI arrives next. Use Sign out in the navbar to return to Login.</p>
          </main>
        </>
      ) : authView === 'register' ? (
        <Register onGoToLogin={() => setAuthView('login')} />
      ) : (
        <Login onGoToRegister={() => setAuthView('register')} />
      )}
    </AuthContext.Provider>
  )
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default App
