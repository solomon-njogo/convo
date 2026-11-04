/** Message / Chat composer helpers — domain language from GLOSSARY.md. */

export const MAX_MESSAGE_LENGTH = 2000

/**
 * Whether the Chat composer may send this draft.
 * Blocks empty/whitespace and text over MAX_MESSAGE_LENGTH.
 */
export function canSendMessage(text) {
  if (typeof text !== 'string') return false
  const trimmed = text.trim()
  if (!trimmed) return false
  if (trimmed.length > MAX_MESSAGE_LENGTH) return false
  return true
}

/**
 * Field-level hint for Chat composer Client validation.
 * Returns null when the draft is sendable or still empty (empty uses disabled Send, not a hint).
 */
export function getComposerHint(text) {
  if (typeof text !== 'string') return null
  if (text.trim().length > MAX_MESSAGE_LENGTH) {
    return `Messages can be at most ${MAX_MESSAGE_LENGTH} characters`
  }
  return null
}

/**
 * Caption under a Message bubble.
 * Pending server timestamp → "Sending…"; otherwise short locale time.
 */
export function formatMessageTimestamp(createdAt, locale) {
  if (createdAt == null) return 'Sending…'

  const date =
    typeof createdAt?.toDate === 'function'
      ? createdAt.toDate()
      : createdAt instanceof Date
        ? createdAt
        : new Date(createdAt)

  if (Number.isNaN(date.getTime())) return 'Sending…'

  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Deterministic 1:1 Conversation id (alphabetical uid pair). */
export function conversationIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join('_')
}

export function isSentByCurrentUser(message, currentUserId) {
  return Boolean(currentUserId) && message?.senderId === currentUserId
}
