import { displayInitials } from '../utils/peers'

export default function UserList({
  peers,
  selectedPeerId,
  onSelectPeer,
  status,
  error,
  onRetry,
  searchQuery,
}) {
  const hasQuery = searchQuery.trim().length > 0

  if (status === 'loading') {
    return (
      <div className="peer-directory-status" role="status" aria-live="polite">
        Loading students…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="peer-directory-status peer-directory-status--error" role="alert">
        <p>{error?.message ?? 'Could not load students.'}</p>
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
          <p>No users found</p>
        ) : (
          <p>No other students yet. Ask a classmate to Register.</p>
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

function PeerAvatar({ peer }) {
  if (peer.photoURL) {
    return (
      <span className="avatar avatar--medium" aria-hidden="true">
        <img src={peer.photoURL} alt="" className="avatar__image" />
      </span>
    )
  }

  return (
    <span className="avatar avatar--medium" aria-hidden="true">
      {displayInitials(peer.displayName)}
    </span>
  )
}
