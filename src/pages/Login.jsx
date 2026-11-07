import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { mapAuthError } from '../utils/authErrors'
import { hasErrors, validateLogin } from '../utils/authValidation'
import './AuthForm.css'

export default function Login({ onGoToRegister }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function clearAuthFailure() {
    if (formError) setFormError('')
  }

  function handleEmailChange(value) {
    setEmail(value)
    clearAuthFailure()
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }))
    }
  }

  function handlePasswordChange(value) {
    setPassword(value)
    clearAuthFailure()
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const errors = validateLogin({ email, password })
    setFieldErrors(errors)
    setFormError('')

    if (hasErrors(errors) || isSubmitting) return

    setIsSubmitting(true)
    try {
      await login({ email: email.trim(), password })
    } catch (error) {
      setFormError(mapAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-signal">
        <p className="auth-signal__brand">Convo</p>
        <p className="auth-signal__line">Class chat that stays with your classmates.</p>
      </aside>

      <div className="auth-panel">
        <div className="auth-panel__inner">
          <h1 className="auth-title">Login</h1>
          <p className="auth-subtitle">
            Enter the email and password you used to register.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {formError ? (
              <p className="auth-form-error" role="alert">
                {formError}
              </p>
            ) : null}

            <label className="field">
              <span className="field__label">Email</span>
              <input
                className="field__control"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              />
              {fieldErrors.email ? (
                <span id="login-email-error" className="field__error">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              />
              {fieldErrors.password ? (
                <span id="login-password-error" className="field__error">
                  {fieldErrors.password}
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
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="auth-switch">
            New to Convo?{' '}
            <button
              type="button"
              className="auth-link"
              onClick={onGoToRegister}
              disabled={isSubmitting}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
