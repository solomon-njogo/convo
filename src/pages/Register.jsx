import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { mapAuthError } from '../utils/authErrors'
import { hasErrors, MIN_PASSWORD_LENGTH, validateRegister } from '../utils/authValidation'
import './AuthForm.css'

export default function Register({ onGoToLogin }) {
  const { register } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function clearAuthFailure() {
    if (formError) setFormError('')
  }

  function clearFieldError(name) {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function handleChange(name, value, setter) {
    setter(value)
    clearAuthFailure()
    clearFieldError(name)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const errors = validateRegister({
      displayName,
      email,
      password,
      confirmPassword,
    })
    setFieldErrors(errors)
    setFormError('')

    if (hasErrors(errors) || isSubmitting) return

    setIsSubmitting(true)
    try {
      await register({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      })
    } catch (error) {
      setFormError(mapAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayNameHintId = 'register-displayName-hint'
  const passwordHintId = 'register-password-hint'

  return (
    <div className="auth-shell">
      <aside className="auth-signal">
        <p className="auth-signal__brand">Convo</p>
        <p className="auth-signal__line">
          Pick a name classmates will recognize in Students.
        </p>
      </aside>

      <div className="auth-panel">
        <div className="auth-panel__inner">
          <h1 className="auth-title">Register</h1>
          <p className="auth-subtitle">
            Add a display name, email, and password to join class chat.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {formError ? (
              <p className="auth-form-error" role="alert">
                {formError}
              </p>
            ) : null}

            <label className="field">
              <span className="field__label">Display name</span>
              <input
                className="field__control"
                type="text"
                name="displayName"
                autoComplete="nickname"
                value={displayName}
                onChange={(e) => handleChange('displayName', e.target.value, setDisplayName)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.displayName)}
                aria-describedby={
                  fieldErrors.displayName
                    ? 'register-displayName-error'
                    : displayNameHintId
                }
              />
              {fieldErrors.displayName ? (
                <span id="register-displayName-error" className="field__error">
                  {fieldErrors.displayName}
                </span>
              ) : (
                <span id={displayNameHintId} className="field__hint">
                  This is how you appear in chat and Students.
                </span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Email</span>
              <input
                className="field__control"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => handleChange('email', e.target.value, setEmail)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
              />
              {fieldErrors.email ? (
                <span id="register-email-error" className="field__error">
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>

            <label className="field">
              <span className="field__label">Password</span>
              <input
                className="field__control"
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => handleChange('password', e.target.value, setPassword)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={
                  fieldErrors.password ? 'register-password-error' : passwordHintId
                }
              />
              {fieldErrors.password ? (
                <span id="register-password-error" className="field__error">
                  {fieldErrors.password}
                </span>
              ) : (
                <span id={passwordHintId} className="field__hint">
                  At least {MIN_PASSWORD_LENGTH} characters.
                </span>
              )}
            </label>

            <label className="field">
              <span className="field__label">Confirm password</span>
              <input
                className="field__control"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) =>
                  handleChange('confirmPassword', e.target.value, setConfirmPassword)
                }
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={
                  fieldErrors.confirmPassword
                    ? 'register-confirmPassword-error'
                    : undefined
                }
              />
              {fieldErrors.confirmPassword ? (
                <span id="register-confirmPassword-error" className="field__error">
                  {fieldErrors.confirmPassword}
                </span>
              ) : null}
            </label>

            <button
              className="btn btn--primary auth-submit"
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn__spinner" aria-hidden="true" />
                  Registering…
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already registered?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={onGoToLogin}
              disabled={isSubmitting}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
