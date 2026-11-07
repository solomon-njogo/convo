import { useEffect, useRef } from 'react'
import {
  formatMessageTimestamp,
  isSentByCurrentUser,
} from '../utils/messages'

const NEAR_BOTTOM_PX = 80

export default function MessageList({
  messages,
  loading,
  error,
  onRetry,
  currentUserId,
  peerDisplayName,
  stickToLatestToken,
}) {
  const scrollerRef = useRef(null)
  const stickRef = useRef(true)

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return undefined

    function onScroll() {
      const distance = node.scrollHeight - node.scrollTop - node.clientHeight
      stickRef.current = distance <= NEAR_BOTTOM_PX
    }

    node.addEventListener('scroll', onScroll, { passive: true })
    return () => node.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    stickRef.current = true
  }, [stickToLatestToken])

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    if (!stickRef.current) return
    node.scrollTop = node.scrollHeight
  }, [messages, loading, stickToLatestToken])

  if (loading) {
    return (
      <div className="message-list-status" role="status" aria-live="polite">
        Loading messages…
      </div>
    )
  }

  if (error) {
    const detail =
      typeof error === 'string'
        ? error
        : typeof error?.message === 'string' && error.message.trim()
          ? error.message
          : 'Check your connection and try again.'

    return (
      <div className="message-list-status message-list-status--error" role="alert">
        <p className="empty-state__title">Couldn’t load messages</p>
        <p>{detail}</p>
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }

  if (messages.length === 0) {
    const name = peerDisplayName?.trim() || 'this classmate'
    return (
      <div className="message-list-status" role="status">
        <p className="empty-state__title">Start the conversation</p>
        <p>
          No messages with {name} yet. Type below and send a hello to get things
          going.
        </p>
      </div>
    )
  }

  return (
    <div className="message-list" ref={scrollerRef} role="log" aria-live="polite">
      <ul className="message-list__items">
        {messages.map((message) => {
          const sent = isSentByCurrentUser(message, currentUserId)
          const senderLabel = sent ? 'You' : (peerDisplayName ?? 'Peer')
          const timeLabel = formatMessageTimestamp(message.createdAt)

          return (
            <li key={message.id} className="message-list__row">
              <article
                className={`message-bubble${sent ? ' message-bubble--sent' : ' message-bubble--received'}`}
                aria-label={`${senderLabel}, ${timeLabel}: ${message.text}`}
              >
                {!sent && (
                  <span className="message-bubble__sender" aria-hidden="true">
                    {peerDisplayName}
                  </span>
                )}
                <p className="message-bubble__body">{message.text}</p>
                <span className="message-bubble__meta" aria-hidden="true">
                  {timeLabel}
                </span>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
