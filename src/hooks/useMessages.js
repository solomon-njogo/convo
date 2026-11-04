import { useCallback, useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'

const EMPTY_RESULT = {
  conversationId: null,
  attempt: -1,
  messages: [],
  error: null,
}

export function useMessages(conversationId) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(EMPTY_RESULT)

  useEffect(() => {
    if (!conversationId) return undefined

    const messagesQuery = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      setResult({
        conversationId,
        attempt,
        messages: snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        })),
        error: null,
      })
    }, (error) => {
      setResult({
        conversationId,
        attempt,
        messages: [],
        error,
      })
    })

    return unsubscribe
  }, [conversationId, attempt])

  const retry = useCallback(() => setAttempt((value) => value + 1), [])
  const resultIsCurrent =
    result.conversationId === conversationId && result.attempt === attempt

  return {
    messages: resultIsCurrent ? result.messages : [],
    loading: Boolean(conversationId) && !resultIsCurrent,
    error: resultIsCurrent ? result.error?.message ?? null : null,
    retry,
  }
}
