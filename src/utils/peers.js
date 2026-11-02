/**
 * Peer directory helpers — domain language from GLOSSARY.md.
 * Peers are User profiles excluding the signed-in person.
 */

export function excludeSelf(profiles, signedInUserId) {
  if (!signedInUserId) return profiles
  return profiles.filter((profile) => profile.id !== signedInUserId)
}

export function filterPeers(peers, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return peers
  return peers.filter((peer) => {
    const name = (peer.displayName ?? '').toLowerCase()
    const email = (peer.email ?? '').toLowerCase()
    return name.includes(needle) || email.includes(needle)
  })
}

export function sortPeers(peers) {
  return [...peers].sort((a, b) => {
    const nameCmp = (a.displayName ?? '').localeCompare(b.displayName ?? '', undefined, {
      sensitivity: 'base',
    })
    if (nameCmp !== 0) return nameCmp
    return (a.email ?? '').localeCompare(b.email ?? '', undefined, { sensitivity: 'base' })
  })
}

export function preparePeerDirectory(profiles, signedInUserId, query) {
  return sortPeers(filterPeers(excludeSelf(profiles, signedInUserId), query))
}

export function displayInitials(displayName) {
  const parts = (displayName ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}
