import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import PeerAvatar from '../components/PeerAvatar'
import { useAuth } from '../context/AuthContext'
import { subscribeToUser } from '../services/chatService'
import { mapAuthError } from '../utils/authErrors'
import { hasErrors, validateDisplayName } from '../utils/authValidation'
import './AuthForm.css'
import './Profile.css'

const EMPTY_PROFILE = {
  userId: null,
  profile: null,
  status: 'loading',
  error: null,
}

function OwnProfileForm({ profile }) {
  const { updateDisplayName } = useAuth()
  const [displayName, setDisplayName] = useState(profile.displayName ?? '')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function clearAuthFailure() {
    if (formError) setFormError('')
    if (successMessage) setSuccessMessage('')
  }

  function clearFieldError(name) {
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  function handleDisplayNameChange(value) {
    setDisplayName(value)
    clearAuthFailure()
    clearFieldError('displayName')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    const displayNameError = validateDisplayName(displayName)
    const errors = displayNameError ? { displayName: displayNameError } : {}
    setFieldErrors(errors)
    setFormError('')
    setSuccessMessage('')

    if (hasErrors(errors)) return

    setIsSubmitting(true)
    try {
      await updateDisplayName(displayName)
      setSuccessMessage(
        'Display name updated. Classmates will see this name in Students and chat.',
      )
    } catch (error) {
      setFormError(mapAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayNameHintId = 'profile-displayName-hint'

  return (
    <form className="auth-form profile-form" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <p className="auth-form-error" role="alert">
          {formError}
        </p>
      ) : null}
      {successMessage ? (
        <p className="profile-success" role="status">
          {successMessage}
        </p>
      ) : null}

      <label className="field">
        <span className="field__label">Display name</span>
        <input
          className="field__control"
          type="text"
          name="displayName"
          autoComplete="nickname"
          maxLength={100}
          value={displayName}
          onChange={(event) => handleDisplayNameChange(event.target.value)}
          aria-invalid={fieldErrors.displayName ? 'true' : undefined}
          aria-describedby={
            fieldErrors.displayName ? 'profile-displayName-error' : displayNameHintId
          }
          disabled={isSubmitting}
        />
        {fieldErrors.displayName ? (
          <span id="profile-displayName-error" className="field__error">
            {fieldErrors.displayName}
          </span>
        ) : (
          <span id={displayNameHintId} className="field__hint">
            This is the name classmates see in Students and chat.
          </span>
        )}
      </label>

      <label className="field">
        <span className="field__label">Email</span>
        <input
          className="field__control"
          type="email"
          value={profile.email ?? ''}
          disabled
          readOnly
        />
        <span className="field__hint">Email can’t be changed here.</span>
      </label>

      <button
        type="submit"
        className="btn btn--primary auth-submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="btn__spinner" aria-hidden="true" />
            Saving…
          </>
        ) : (
          'Save display name'
        )}
      </button>
    </form>
  )
}

export default function Profile({ userId, onBack }) {
  const { user } = useAuth()
  const isOwnProfile = Boolean(user?.uid && user.uid === userId)

  const [result, setResult] = useState(EMPTY_PROFILE)
  const resultIsCurrent = result.userId === userId
  const status = !userId
    ? 'missing'
    : resultIsCurrent
      ? result.status
      : 'loading'
  const profile = resultIsCurrent ? result.profile : null
  useEffect(() => {
    if (!userId) return undefined

    return subscribeToUser(
      userId,
      (nextProfile) => {
        setResult({
          userId,
          profile: nextProfile,
          status: nextProfile ? 'ready' : 'missing',
          error: null,
        })
      },
      (error) => {
        setResult({
          userId,
          profile: null,
          status: 'error',
          error:
            error instanceof Error
              ? error
              : new Error('We couldn’t load this profile.'),
        })
      },
    )
  }, [userId])

  return (
    <div className="profile-shell">
      <div className="profile-panel">
        <button type="button" className="profile-back" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          Back to chat
        </button>

        <h1 className="profile-title">{isOwnProfile ? 'Your profile' : 'Profile'}</h1>

        {status === 'loading' ? (
          <p className="profile-status" role="status" aria-live="polite">
            Loading profile…
          </p>
        ) : null}

        {status === 'error' ? (
          <p className="auth-form-error" role="alert">
            We couldn’t load this profile. Check your connection, then go back
            and try again.
          </p>
        ) : null}

        {status === 'missing' ? (
          <div className="profile-status" role="status">
            <p className="empty-state__title">Profile not found</p>
            <p>
              We couldn’t find this profile. Go back to chat and pick another
              student.
            </p>
          </div>
        ) : null}

        {status === 'ready' && profile ? (
          <>
            <div className="profile-identity">
              <PeerAvatar peer={profile} size="medium" />
              <div className="profile-identity__text">
                <p className="profile-identity__name">{profile.displayName}</p>
                <p className="profile-identity__email">{profile.email}</p>
              </div>
            </div>

            {isOwnProfile ? (
              <OwnProfileForm key={userId} profile={profile} />
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
