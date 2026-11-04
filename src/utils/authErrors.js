const DUPLICATE_EMAIL_CODES = new Set(['auth/email-already-in-use'])

const BAD_CREDENTIAL_CODES = new Set([
  'auth/wrong-password',
  'auth/user-not-found',
  'auth/invalid-credential',
  'auth/invalid-email',
  'auth/invalid-login-credentials',
])

function getFirebaseErrorCode(error) {
  const pending = [error]
  const visited = new Set()

  while (pending.length > 0) {
    const current = pending.shift()
    if (!current || typeof current !== 'object' || visited.has(current)) continue
    visited.add(current)

    if (typeof current.code === 'string') return current.code
    if (current.errors && Symbol.iterator in Object(current.errors)) {
      pending.push(...current.errors)
    }
    if (current.cause) pending.push(current.cause)
  }

  return ''
}

/** Map Auth failures (Firebase-style codes) to form-level copy. */
export function mapAuthError(error) {
  const code = getFirebaseErrorCode(error)

  if (DUPLICATE_EMAIL_CODES.has(code)) {
    return 'This email is already registered'
  }

  if (BAD_CREDENTIAL_CODES.has(code)) {
    return 'Incorrect email or password'
  }

  if (code === 'permission-denied') {
    return 'Firestore denied access to your profile. Publish firestore.rules to the configured Firebase project, then sign in again.'
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Email/password sign-in is disabled. Enable the provider in Firebase Authentication.'
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait before trying again.'
  }

  return 'Something went wrong. Please try again.'
}
