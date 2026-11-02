import {
  collection,
  doc,
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

function mapUserDocument(snapshot) {
  return {
    ...snapshot.data(),
    uid: snapshot.id,
  }
}

export async function getAllUsers(currentUserId) {
  if (!currentUserId) {
    throw new Error('The current user ID is required.')
  }

  const snapshot = await getDocs(collection(db, 'users'))
  return snapshot.docs
    .map(mapUserDocument)
    .filter((user) => user.uid !== currentUserId)
}

export function subscribeToUsers(currentUserId, callback, onError) {
  if (!currentUserId) {
    throw new Error('The current user ID is required.')
  }

  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const users = snapshot.docs
      .map(mapUserDocument)
      .filter((user) => user.uid !== currentUserId)
    callback(users)
  }, onError)
}

export function getConversationId(uid1, uid2) {
  if (!uid1 || !uid2 || uid1 === uid2) {
    throw new Error('A conversation requires two different user IDs.')
  }

  return [uid1, uid2].sort().join('_')
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
