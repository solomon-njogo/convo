import { displayInitials } from '../utils/peers'

export default function PeerAvatar({ peer, size = 'medium' }) {
  const sizeClass = size === 'small' ? 'avatar--small' : 'avatar--medium'

  if (peer.photoURL) {
    return (
      <span className={`avatar ${sizeClass}`} aria-hidden="true">
        <img src={peer.photoURL} alt="" className="avatar__image" />
      </span>
    )
  }

  return (
    <span className={`avatar ${sizeClass}`} aria-hidden="true">
      {displayInitials(peer.displayName)}
    </span>
  )
}
