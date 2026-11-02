import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import UserList from '../components/UserList'
import UserSearch from '../components/UserSearch'
import { useAuth } from '../context/AuthContext'
import { usePeers } from '../hooks/usePeers'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isWide, setIsWide] = useState(readIsWide)

  const toggleRef = useRef(null)
  const drawerRef = useRef(null)
  const titleId = useId()

  if (
    selectedPeerId !== null &&
    !profiles.some((profile) => profile.id === selectedPeerId)
  ) {
    setSelectedPeerId(null)
  }

  const selectedPeer = useMemo(() => {
    if (!selectedPeerId) return null
    return profiles.find((profile) => profile.id === selectedPeerId) ?? null
  }, [profiles, selectedPeerId])

  const visiblePeers = useMemo(
    () => preparePeerDirectory(profiles, user?.uid, searchQuery),
    [profiles, user?.uid, searchQuery],
  )

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
    setSelectedPeerId(peer.id)
    if (!isWide) {
      setSidebarOpen(false)
      queueMicrotask(() => toggleRef.current?.focus())
    }
  }

  const showDrawer = !isWide && sidebarOpen
  const selectedVisible =
    selectedPeer && visiblePeers.some((peer) => peer.id === selectedPeer.id)
      ? selectedPeer.id
      : null

  return (
    <div className="chat-layout">
      {!isWide && (
        <div className="chat-toolbar">
          <button
            ref={toggleRef}
            type="button"
            className="btn btn--icon chat-toolbar__toggle"
            aria-expanded={sidebarOpen}
            aria-controls="peer-directory"
            onClick={() => setSidebarOpen((open) => !open)}
          >
            {sidebarOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span className="visually-hidden">
              {sidebarOpen ? 'Close peers' : 'Open peers'}
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
          <div className="chat-pane__active">
            <h2 className="chat-pane__peer-name">{selectedPeer.displayName}</h2>
            <p className="chat-pane__hint">
              Messages arrive next. Say hello when messaging is ready — the Conversation
              starts on your first send.
            </p>
          </div>
        ) : (
          <div className="chat-pane__empty">
            <p>Select a student to start chatting</p>
          </div>
        )}
      </section>
    </div>
  )
}
