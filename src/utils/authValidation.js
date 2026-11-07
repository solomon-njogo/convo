const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD_LENGTH = 6

export function validateDisplayName(displayName) {
  const trimmedName = displayName?.trim() ?? ''

  if (!trimmedName) {
    return 'Enter a display name classmates will recognize'
  }
  if (trimmedName.length > 100) {
    return 'Display name must be 100 characters or fewer'
  }
  return undefined
}

export function validateLogin({ email, password }) {
  const errors = {}

  if (!email?.trim()) {
    errors.email = 'Enter your email'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email (e.g., name@school.edu)'
  }

  if (!password) {
    errors.password = 'Enter your password'
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`
  }

  return errors
}

export function validateRegister({ displayName, email, password, confirmPassword }) {
  const errors = validateLogin({ email, password })
  const displayNameError = validateDisplayName(displayName)
  if (displayNameError) {
    errors.displayName = displayNameError
  }

  if (email?.trim().length > 254) {
    errors.email = 'Email must be 254 characters or fewer'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Re-enter your password to confirm'
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords don’t match. Try again.'
  }

  return errors
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}
