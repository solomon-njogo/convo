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
    return 'This email is already registered. Sign in, or use a different email.'
  }

  if (BAD_CREDENTIAL_CODES.has(code)) {
    return 'That email or password doesn’t match. Check both and try again.'
  }

  if (code === 'permission-denied') {
    return 'We couldn’t save your profile because Firestore denied access. You remain signed in. Ask whoever manages this Convo project to deploy firestore.rules, then sign out and sign in again.'
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Email and password sign-in is turned off for this project. Ask whoever manages Convo to enable it in Firebase Authentication.'
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Wait a minute, then try again.'
  }

  return 'We couldn’t finish that. Check your connection and try again.'
}
