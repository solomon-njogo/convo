import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

export async function registerUser({ email, password, displayName }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const user = credential.user

  try {
    await updateProfile(user, { displayName })
    await setDoc(doc(db, 'users', user.uid), {
      displayName,
      email,
      photoURL: user.photoURL ?? null,
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    try {
      await deleteUser(user)
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        'Registration failed and the new account could not be removed.',
        { cause: cleanupError },
      )
    }
    throw new Error('Could not create the user profile.', { cause: error })
  }

  return user
}

export async function loginUser({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function logoutUser() {
  await signOut(auth)
}
