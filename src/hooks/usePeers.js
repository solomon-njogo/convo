import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { subscribeToUsers } from '../services/chatService'

const EMPTY_RESULT = {
  uid: null,
  attempt: -1,
  peers: [],
  status: 'loading',
  error: null,
}

export function usePeers() {
  const { user } = useAuth()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(EMPTY_RESULT)
  const uid = user?.uid ?? null

  useEffect(() => {
    if (!uid) return undefined

    return subscribeToUsers(uid, (peers) => {
      setResult({
        uid,
        attempt,
        peers,
        status: 'ready',
        error: null,
      })
    }, (error) => {
      setResult({
        uid,
        attempt,
        peers: [],
        status: 'error',
        error,
      })
    })
  }, [uid, attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])
  const resultIsCurrent = result.uid === uid && result.attempt === attempt

  return {
    peers: resultIsCurrent ? result.peers : [],
    status: resultIsCurrent ? result.status : 'loading',
    error: resultIsCurrent ? result.error : null,
    retry,
  }
}
