import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase/config'

const EMPTY_RESULT = {
  conversationId: null,
  messages: [],
  loading: false,
  error: null,
}

export function useMessages(conversationId) {
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
        messages: snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        })),
        loading: false,
        error: null,
      })
    }, (error) => {
      setResult({
        conversationId,
        messages: [],
        loading: false,
        error: error.message,
      })
    })

    return unsubscribe
  }, [conversationId])

  const resultIsCurrent = result.conversationId === conversationId
  return {
    messages: resultIsCurrent ? result.messages : [],
    loading: Boolean(conversationId) && (!resultIsCurrent || result.loading),
    error: resultIsCurrent ? result.error : null,
  }
}
