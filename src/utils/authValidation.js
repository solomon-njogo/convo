const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD_LENGTH = 6

export function validateLogin({ email, password }) {
  const errors = {}

  if (!email?.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  }

  return errors
}

export function validateRegister({ displayName, email, password, confirmPassword }) {
  const errors = validateLogin({ email, password })
  const trimmedName = displayName?.trim() ?? ''

  if (!trimmedName) {
    errors.displayName = 'Display name is required'
  } else if (trimmedName.length > 100) {
    errors.displayName = 'Display name must be at most 100 characters'
  }

  if (email?.trim().length > 254) {
    errors.email = 'Email must be at most 254 characters'
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your password'
  } else if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}
