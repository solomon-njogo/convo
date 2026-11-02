import { useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import { AuthContext } from './context/AuthContext'
import {
  DEMO_USERS_KEY,
  notifyDemoUsersChanged,
} from './hooks/usePeers'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Register from './pages/Register'
import { ensureDemoStudents } from './utils/demoStudents'
import './App.css'

/**
 * Temporary demo wiring so Person A UI can run before Firebase auth plumbing lands.
 * Auth/routing owner: replace this Provider value with real AuthProvider + route gate.
 */

ensureDemoStudents()

function readDemoUsers() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
  notifyDemoUsersChanged()
}

function ensureUid(record, emailKey) {
  if (record.uid) return record
  return { ...record, uid: `demo_${emailKey}` }
}

function toSessionUser(record) {
  return {
    uid: record.uid,
    displayName: record.displayName,
    email: record.email,
  }
}

function App() {
  const [user, setUser] = useState(null)
  const [authView, setAuthView] = useState('login')

  const auth = useMemo(
    () => ({
      user,
      async login({ email, password }) {
        await delay(450)
        const key = email.toLowerCase()
        const users = readDemoUsers()
        const record = users[key]
        if (!record || record.password !== password) {
          const error = new Error('Incorrect email or password')
          error.code = 'auth/invalid-credential'
          throw error
        }
        const withUid = ensureUid(record, key)
        if (!record.uid) {
          users[key] = withUid
          writeDemoUsers(users)
        }
        setUser(toSessionUser(withUid))
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
        const uid =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `demo_${key}_${Date.now()}`
        users[key] = { uid, displayName, email, password, photoURL: null }
        writeDemoUsers(users)
        setUser(toSessionUser(users[key]))
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
          <main className="app-chat">
            <Chat />
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
