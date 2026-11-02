import { useCallback, useEffect, useState } from 'react'

export const DEMO_USERS_KEY = 'convo-demo-users'
export const DEMO_USERS_CHANGED = 'convo-demo-users-changed'

/**
 * Temporary demo Peer directory source (localStorage).
 * Data owner: replace with Firestore users listener + unsubscribe.
 */
function readDemoProfiles() {
  try {
    const users = JSON.parse(localStorage.getItem(DEMO_USERS_KEY) ?? '{}')
    return Object.values(users)
      .filter((record) => record?.uid)
      .map((record) => ({
        id: record.uid,
        displayName: record.displayName,
        email: record.email,
        photoURL: record.photoURL ?? null,
      }))
  } catch {
    return []
  }
}

export function notifyDemoUsersChanged() {
  window.dispatchEvent(new Event(DEMO_USERS_CHANGED))
}

export function usePeers() {
  const [peers, setPeers] = useState(() => readDemoProfiles())
  const [status, setStatus] = useState('ready')
  const [error, setError] = useState(null)

  const applyProfiles = useCallback((options = {}) => {
    if (options.showLoading) {
      setStatus('loading')
      setError(null)
    }
    try {
      setPeers(readDemoProfiles())
      setStatus('ready')
      setError(null)
    } catch (err) {
      setPeers([])
      setError(err instanceof Error ? err : new Error('Could not load peers'))
      setStatus('error')
    }
  }, [])

  const refresh = useCallback(() => applyProfiles(), [applyProfiles])
  const retry = useCallback(() => applyProfiles({ showLoading: true }), [applyProfiles])

  useEffect(() => {
    function onStorage(event) {
      if (event.key === DEMO_USERS_KEY || event.key === null) refresh()
    }

    function onLocalChange() {
      refresh()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(DEMO_USERS_CHANGED, onLocalChange)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(DEMO_USERS_CHANGED, onLocalChange)
    }
  }, [refresh])

  return { peers, status, error, retry }
}
