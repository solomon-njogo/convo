import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import { validateDisplayName } from '../utils/authValidation'

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

export async function updateDisplayName(displayName) {
  const user = auth.currentUser
  if (!user) {
    throw new Error('You must be signed in to update your display name.')
  }

  const displayNameError = validateDisplayName(displayName)
  if (displayNameError) {
    throw new Error(displayNameError)
  }

  const normalizedDisplayName = displayName.trim()
  const profileRef = doc(db, 'users', user.uid)
  const snapshot = await getDoc(profileRef)

  if (!snapshot.exists()) {
    throw new Error('Your profile could not be found. Sign out and back in to restore it.')
  }

  const existing = snapshot.data()
  await updateProfile(user, { displayName: normalizedDisplayName })
  await updateDoc(profileRef, {
    displayName: normalizedDisplayName,
    email: existing.email,
    photoURL: existing.photoURL ?? null,
    createdAt: existing.createdAt,
  })
  await user.reload()
  return auth.currentUser
}

export async function logoutUser() {
  await signOut(auth)
}
