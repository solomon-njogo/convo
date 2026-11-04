import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

function getUserProfile(user, displayName = user.displayName) {
  const email = user.email?.trim()
  const name = displayName?.trim().slice(0, 100)

  if (!email || !name) {
    throw new Error('The account is missing the email or display name required for its profile.')
  }

  return {
    displayName: name,
    email,
    photoURL: user.photoURL ?? null,
    createdAt: serverTimestamp(),
  }
}

async function ensureUserProfile(user) {
  const profileRef = doc(db, 'users', user.uid)
  const fallbackName = user.email?.split('@')[0] || 'Student'
  const profile = getUserProfile(user, user.displayName || fallbackName)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(profileRef)
    if (!snapshot.exists()) {
      transaction.set(profileRef, profile)
    }
  })
}

export async function registerUser({ email, password, displayName }) {
  const normalizedEmail = email.trim()
  const normalizedDisplayName = displayName.trim()
  const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
  const user = credential.user

  await updateProfile(user, { displayName: normalizedDisplayName })
  await setDoc(
    doc(db, 'users', user.uid),
    getUserProfile(user, normalizedDisplayName),
  )

  return user
}

export async function loginUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)

  await ensureUserProfile(credential.user)

  return credential
}

export async function logoutUser() {
  await signOut(auth)
}
