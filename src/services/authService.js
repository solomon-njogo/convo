import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

export async function registerUser({ email, password, displayName }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const user = credential.user

  await updateProfile(user, { displayName })
  await setDoc(doc(db, 'users', user.uid), {
    displayName,
    email,
    photoURL: user.photoURL ?? null,
    createdAt: serverTimestamp(),
  })

  return user
}

export async function loginUser({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logoutUser() {
  await signOut(auth)
}
