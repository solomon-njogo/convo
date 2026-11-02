import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEMO_CONVERSATIONS_CHANGED,
  DEMO_CONVERSATIONS_KEY,
  listMessages,
} from '../services/chatService'

/**
 * Temporary demo Message listener (localStorage).
 * Data owner: replace with Firestore onSnapshot ordered by createdAt + unsubscribe.
 *
 * @param {string | null} conversationId
 * @returns {{ messages: Array, loading: boolean, error: string | null, retry: () => void }}
 */
export function useMessages(conversationId) {
  const activeId = conversationId ?? null
  const [tick, setTick] = useState(0)
  const [loadError, setLoadError] = useState(null)
  const [trackedId, setTrackedId] = useState(activeId)

  if (trackedId !== activeId) {
    setTrackedId(activeId)
    setLoadError(null)
  }

  const messages = useMemo(() => {
    if (!activeId) return []
    try {
      void tick
      return listMessages(activeId)
    } catch {
      return []
    }
  }, [activeId, tick])

  const retry = useCallback(() => {
    if (!activeId) return
    try {
      listMessages(activeId)
      setLoadError(null)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load messages')
    }
    setTick((value) => value + 1)
  }, [activeId])

  useEffect(() => {
    if (!activeId) return undefined

    function bump() {
      try {
        listMessages(activeId)
        setLoadError(null)
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Could not load messages')
      }
      setTick((value) => value + 1)
    }

    function onStorage(event) {
      if (event.key === DEMO_CONVERSATIONS_KEY || event.key === null) bump()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(DEMO_CONVERSATIONS_CHANGED, bump)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(DEMO_CONVERSATIONS_CHANGED, bump)
    }
  }, [activeId])

  return {
    messages,
    loading: false,
    error: activeId ? loadError : null,
    retry,
  }
}
