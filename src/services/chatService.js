import { conversationIdFor } from '../utils/messages'

/**
 * Temporary demo Conversation + Message store (localStorage).
 * Data owner: replace with Firestore chatService (getOrCreate + sendMessage + listeners).
 */

export const DEMO_CONVERSATIONS_KEY = 'convo-demo-conversations'
export const DEMO_CONVERSATIONS_CHANGED = 'convo-demo-conversations-changed'

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_CONVERSATIONS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeStore(store) {
  localStorage.setItem(DEMO_CONVERSATIONS_KEY, JSON.stringify(store))
  window.dispatchEvent(new Event(DEMO_CONVERSATIONS_CHANGED))
}

/** Returns Conversation id if a Conversation already exists; otherwise null. */
export function findExistingConversationId(currentUserId, peerId) {
  if (!currentUserId || !peerId) return null
  const id = conversationIdFor(currentUserId, peerId)
  const store = readStore()
  return store[id] ? id : null
}

/**
 * Creates Conversation on first send if needed, appends Message, returns conversationId.
 * @returns {Promise<string>}
 */
export async function sendMessageToPeer({ currentUserId, peerId, text }) {
  const trimmed = text.trim()
  if (!currentUserId || !peerId || !trimmed) {
    throw new Error('Could not send message')
  }

  await delay(180)

  const conversationId = conversationIdFor(currentUserId, peerId)
  const store = readStore()
  const existing = store[conversationId] ?? {
    participants: [currentUserId, peerId].sort(),
    messages: [],
  }

  const message = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `msg_${Date.now()}`,
    senderId: currentUserId,
    text: trimmed,
    createdAt: null,
  }

  existing.messages = [...existing.messages, message]
  existing.lastMessage = trimmed
  existing.updatedAt = new Date().toISOString()
  store[conversationId] = existing
  writeStore(store)

  // Simulate serverTimestamp resolving after a short delay
  setTimeout(() => {
    const latest = readStore()
    const convo = latest[conversationId]
    if (!convo) return
    const idx = convo.messages.findIndex((m) => m.id === message.id)
    if (idx === -1) return
    convo.messages[idx] = {
      ...convo.messages[idx],
      createdAt: new Date().toISOString(),
    }
    writeStore(latest)
  }, 160)

  return conversationId
}

export function listMessages(conversationId) {
  if (!conversationId) return []
  const store = readStore()
  const convo = store[conversationId]
  if (!convo?.messages) return []
  return convo.messages.map((m) => ({ ...m }))
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
