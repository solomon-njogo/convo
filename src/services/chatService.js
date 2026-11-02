import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { conversationIdFor } from '../utils/messages'

function mapUserDocument(snapshot) {
  return {
    ...snapshot.data(),
    id: snapshot.id,
  }
}

export async function getAllUsers(currentUserId) {
  if (!currentUserId) {
    throw new Error('The current user ID is required.')
  }

  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs
    .map(mapUserDocument)
    .filter((user) => user.id !== currentUserId)
}

export function subscribeToUsers(currentUserId, callback, onError) {
  if (!currentUserId) {
    throw new Error('The current user ID is required.')
  }

  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const users = snapshot.docs
      .map(mapUserDocument)
      .filter((user) => user.id !== currentUserId)
    callback(users)
  }, onError)
}

export function getConversationId(uid1, uid2) {
  if (!uid1 || !uid2 || uid1 === uid2) {
    throw new Error('A conversation requires two different user IDs.')
  }
  return conversationIdFor(uid1, uid2)
}

export async function findExistingConversationId(currentUserId, peerId) {
  const conversationId = getConversationId(currentUserId, peerId)
  const conversation = await getDoc(doc(db, 'conversations', conversationId))
  return conversation.exists() ? conversationId : null
}

export async function getOrCreateConversation(uid1, uid2) {
  const conversationId = getConversationId(uid1, uid2)
  const conversationRef = doc(db, 'conversations', conversationId)
  const participants = [uid1, uid2].sort()

  await runTransaction(db, async (transaction) => {
    const conversation = await transaction.get(conversationRef)
    if (!conversation.exists()) {
      transaction.set(conversationRef, {
        participants,
        createdAt: serverTimestamp(),
        lastMessage: null,
        updatedAt: serverTimestamp(),
      })
    }
  })

  return conversationId
}

export async function sendMessage(conversationId, senderId, text) {
  if (!conversationId || !senderId || typeof text !== 'string') {
    throw new Error('A conversation, sender, and message are required.')
  }

  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('Message cannot be empty.')
  }
  if (trimmed.length > 2000) {
    throw new Error('Message cannot exceed 2000 characters.')
  }

  const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'))
  const conversationRef = doc(db, 'conversations', conversationId)
  const batch = writeBatch(db)
  batch.set(messageRef, {
    senderId,
    text: trimmed,
    createdAt: serverTimestamp(),
  })
  batch.update(conversationRef, {
    lastMessage: trimmed,
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}

export async function sendMessageToPeer({ currentUserId, peerId, text }) {
  const conversationId = getConversationId(currentUserId, peerId)
  if (typeof text !== 'string') {
    throw new Error('A message is required.')
  }
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('Message cannot be empty.')
  }
  if (trimmed.length > 2000) {
    throw new Error('Message cannot exceed 2000 characters.')
  }

  const conversationRef = doc(db, 'conversations', conversationId)
  const messageRef = doc(collection(db, 'conversations', conversationId, 'messages'))
  await runTransaction(db, async (transaction) => {
    const conversation = await transaction.get(conversationRef)
    if (conversation.exists()) {
      const participants = conversation.data().participants
      if (!participants?.includes(currentUserId) || !participants.includes(peerId)) {
        throw new Error('Conversation participants do not match.')
      }
      transaction.update(conversationRef, {
        lastMessage: trimmed,
        updatedAt: serverTimestamp(),
      })
    } else {
      transaction.set(conversationRef, {
        participants: [currentUserId, peerId].sort(),
        createdAt: serverTimestamp(),
        lastMessage: trimmed,
        updatedAt: serverTimestamp(),
      })
    }

    transaction.set(messageRef, {
      senderId: currentUserId,
      text: trimmed,
      createdAt: serverTimestamp(),
    })
  })

  return conversationId
}

export function subscribeToUserConversations(uid, callback, onError) {
  if (!uid) {
    throw new Error('The current user ID is required.')
  }

  const conversationsQuery = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid),
    orderBy('updatedAt', 'desc'),
  )

  return onSnapshot(conversationsQuery, (snapshot) => {
    callback(snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })))
  }, onError)
}
