import MessageInput from './MessageInput'
import MessageList from './MessageList'
import PeerAvatar from './PeerAvatar'

export default function ChatWindow({
  peer,
  messages,
  loading,
  error,
  onRetry,
  currentUserId,
  onSend,
  stickToLatestToken,
  onOpenPeerProfile,
}) {
  return (
    <div className="chat-window">
      <header className="chat-window__header">
        <button
          type="button"
          className="chat-window__profile"
          onClick={() => onOpenPeerProfile?.(peer.id)}
          aria-label={`View ${peer.displayName}'s profile`}
        >
          <PeerAvatar peer={peer} />
          <h2 className="chat-window__name">{peer.displayName}</h2>
        </button>
      </header>

      <div className="chat-window__messages">
        <MessageList
          messages={messages}
          loading={loading}
          error={error}
          onRetry={onRetry}
          currentUserId={currentUserId}
          peerDisplayName={peer.displayName}
          stickToLatestToken={stickToLatestToken}
        />
      </div>

      <div className="chat-window__composer">
        <MessageInput
          key={`composer-${peer.id}`}
          onSend={onSend}
          peerDisplayName={peer.displayName}
        />
      </div>
    </div>
  )
}
