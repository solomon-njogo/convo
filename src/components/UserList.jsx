import PeerAvatar from './PeerAvatar'

export default function UserList({
  peers,
  selectedPeerId,
  onSelectPeer,
  status,
  error,
  onRetry,
  searchQuery,
}) {
  const trimmedQuery = searchQuery.trim()
  const hasQuery = trimmedQuery.length > 0

  if (status === 'loading') {
    return (
      <div className="peer-directory-status" role="status" aria-live="polite">
        Loading students…
      </div>
    )
  }

  if (status === 'error') {
    const detail =
      typeof error?.message === 'string' &&
      error.message.trim() &&
      !/permission|firestore|firebase/i.test(error.message)
        ? error.message
        : 'Check your connection and try again.'

    return (
      <div className="peer-directory-status peer-directory-status--error" role="alert">
        <p className="empty-state__title">Couldn’t load students</p>
        <p>{detail}</p>
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Try again
        </button>
      </div>
    )
  }

  if (peers.length === 0) {
    return (
      <div className="peer-directory-status" role="status">
        {hasQuery ? (
          <>
            <p className="empty-state__title">No matches</p>
            <p>
              No students match “{trimmedQuery}”. Try a different name or email.
            </p>
          </>
        ) : (
          <>
            <p className="empty-state__title">No classmates yet</p>
            <p>
              When classmates register, they’ll show up here so you can message them.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <ul className="peer-list" role="list">
      {peers.map((peer) => {
        const selected = peer.id === selectedPeerId
        return (
          <li key={peer.id}>
            <button
              type="button"
              className={`user-list-item${selected ? ' user-list-item--selected' : ''}`}
              aria-pressed={selected}
              onClick={() => onSelectPeer(peer)}
            >
              <PeerAvatar peer={peer} />
              <span className="user-list-item__name">{peer.displayName}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
