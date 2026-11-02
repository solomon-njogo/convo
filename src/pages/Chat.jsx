import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Menu, X } from 'lucide-react'
import ChatWindow from '../components/ChatWindow'
import UserList from '../components/UserList'
import UserSearch from '../components/UserSearch'
import { useAuth } from '../context/AuthContext'
import { useMessages } from '../hooks/useMessages'
import { usePeers } from '../hooks/usePeers'
import {
  findExistingConversationId,
  sendMessageToPeer,
} from '../services/chatService'
import { preparePeerDirectory } from '../utils/peers'
import './Chat.css'

const TABLET_MQ = '(min-width: 780px)'

function readIsWide() {
  if (typeof window === 'undefined') return true
  return window.matchMedia(TABLET_MQ).matches
}

export default function Chat() {
  const { user } = useAuth()
  const { peers: profiles, status, error, retry } = usePeers()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeerId, setSelectedPeerId] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [stickToLatestToken, setStickToLatestToken] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isWide, setIsWide] = useState(readIsWide)

  const toggleRef = useRef(null)
  const drawerRef = useRef(null)
  const selectedPeerIdRef = useRef(selectedPeerId)
  const titleId = useId()

  useEffect(() => {
    selectedPeerIdRef.current = selectedPeerId
  }, [selectedPeerId])

  if (
    selectedPeerId !== null &&
    !profiles.some((profile) => profile.id === selectedPeerId)
  ) {
    setSelectedPeerId(null)
    setConversationId(null)
  }

  const selectedPeer = useMemo(() => {
    if (!selectedPeerId) return null
    return profiles.find((profile) => profile.id === selectedPeerId) ?? null
  }, [profiles, selectedPeerId])

  const visiblePeers = useMemo(
    () => preparePeerDirectory(profiles, user?.uid, searchQuery),
    [profiles, user?.uid, searchQuery],
  )

  const { messages, loading, error: messagesError, retry: retryMessages } =
    useMessages(conversationId)

  useEffect(() => {
    const media = window.matchMedia(TABLET_MQ)
    function onChange(event) {
      setIsWide(event.matches)
      if (event.matches) setSidebarOpen(false)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (isWide || !sidebarOpen) return undefined

    const toggleNode = toggleRef.current
    const focusTarget = drawerRef.current?.querySelector(
      'input, button, [href], [tabindex]:not([tabindex="-1"])',
    )
    focusTarget?.focus?.()

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setSidebarOpen(false)
        toggleNode?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      toggleNode?.focus()
    }
  }, [isWide, sidebarOpen])

  function handleSelectPeer(peer) {
    selectedPeerIdRef.current = peer.id
    setSelectedPeerId(peer.id)
    setConversationId(findExistingConversationId(user?.uid, peer.id))
    setStickToLatestToken((token) => token + 1)
    if (!isWide) {
      setSidebarOpen(false)
      queueMicrotask(() => toggleRef.current?.focus())
    }
  }

  function handleBack() {
    selectedPeerIdRef.current = null
    setSelectedPeerId(null)
    setConversationId(null)
    setSidebarOpen(false)
    queueMicrotask(() => toggleRef.current?.focus())
  }

  async function handleSend(text) {
    if (!user?.uid || !selectedPeer) {
      throw new Error('Select a student before sending')
    }
    const peerIdAtSend = selectedPeer.id
    const nextId = await sendMessageToPeer({
      currentUserId: user.uid,
      peerId: peerIdAtSend,
      text,
    })
    if (selectedPeerIdRef.current !== peerIdAtSend) return
    setConversationId(nextId)
    setStickToLatestToken((token) => token + 1)
  }

  const showDrawer = !isWide && sidebarOpen
  const selectedVisible =
    selectedPeer && visiblePeers.some((peer) => peer.id === selectedPeer.id)
      ? selectedPeer.id
      : null
  const showBack = !isWide && Boolean(selectedPeer)

  return (
    <div className="chat-layout">
      {!isWide && (
        <div className="chat-toolbar">
          <button
            ref={toggleRef}
            type="button"
            className="btn btn--icon chat-toolbar__toggle"
            aria-expanded={showBack ? undefined : sidebarOpen}
            aria-controls={showBack ? undefined : 'peer-directory'}
            onClick={() => {
              if (showBack) {
                handleBack()
                return
              }
              setSidebarOpen((open) => !open)
            }}
          >
            {showBack ? (
              <ArrowLeft size={20} aria-hidden="true" />
            ) : sidebarOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
            <span className="visually-hidden">
              {showBack
                ? 'Back to students'
                : sidebarOpen
                  ? 'Close peers'
                  : 'Open peers'}
            </span>
          </button>
          <p className="chat-toolbar__label">
            {selectedPeer ? selectedPeer.displayName : 'Students'}
          </p>
        </div>
      )}

      {showDrawer && (
        <button
          type="button"
          className="chat-backdrop"
          aria-label="Close peers"
          onClick={() => {
            setSidebarOpen(false)
            toggleRef.current?.focus()
          }}
        />
      )}

      <aside
        id="peer-directory"
        ref={drawerRef}
        className={`chat-sidebar${showDrawer ? ' chat-sidebar--open' : ''}${
          !isWide ? ' chat-sidebar--drawer' : ''
        }`}
        aria-labelledby={titleId}
        inert={!isWide && !sidebarOpen ? true : undefined}
      >
        <div className="chat-sidebar__header">
          <h2 id={titleId} className="chat-sidebar__title">
            Students
          </h2>
        </div>
        <div className="chat-sidebar__search">
          <UserSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="chat-sidebar__list">
          <UserList
            peers={visiblePeers}
            selectedPeerId={selectedVisible}
            onSelectPeer={handleSelectPeer}
            status={status}
            error={error}
            onRetry={retry}
            searchQuery={searchQuery}
          />
        </div>
      </aside>

      <section className="chat-pane" aria-live="polite">
        {selectedPeer ? (
          <ChatWindow
            peer={selectedPeer}
            messages={messages}
            loading={Boolean(conversationId) && loading}
            error={messagesError}
            onRetry={retryMessages}
            currentUserId={user?.uid}
            onSend={handleSend}
            stickToLatestToken={stickToLatestToken}
          />
        ) : (
          <div className="chat-pane__empty">
            <p>Select a student to start chatting</p>
          </div>
        )}
      </section>
    </div>
  )
}
