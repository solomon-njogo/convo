const DUPLICATE_EMAIL_CODES = new Set(['auth/email-already-in-use'])

const BAD_CREDENTIAL_CODES = new Set([
  'auth/wrong-password',
  'auth/user-not-found',
  'auth/invalid-credential',
  'auth/invalid-email',
  'auth/invalid-login-credentials',
])

/** Map Auth failures (Firebase-style codes) to form-level copy. */
export function mapAuthError(error) {
  const code = error?.code ?? ''

  if (DUPLICATE_EMAIL_CODES.has(code)) {
    return 'This email is already registered'
  }

  if (BAD_CREDENTIAL_CODES.has(code)) {
    return 'Incorrect email or password'
  }

  return 'Something went wrong. Please try again.'
}
