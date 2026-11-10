import { describe, expect, it } from 'vitest'
import { mapAuthError } from './authErrors'

describe('mapAuthError', () => {
  it('explains how to resolve Firestore profile permission failures', () => {
    const error = new Error('Could not create the user profile.', {
      cause: { code: 'permission-denied' },
    })

    expect(mapAuthError(error)).toContain('deploy firestore.rules')
    expect(mapAuthError(error)).toContain('remain signed in')
  })

  it('finds Firebase errors wrapped in an AggregateError', () => {
    const error = new AggregateError(
      [{ code: 'permission-denied' }, new Error('Cleanup failed')],
      'Registration cleanup failed',
    )

    expect(mapAuthError(error)).toContain('deploy firestore.rules')
  })

  it('keeps invalid credentials distinct from Firestore failures', () => {
    expect(mapAuthError({ code: 'auth/invalid-credential' })).toBe(
      'That email or password doesn’t match. Check both and try again.',
    )
  })

  it('points duplicate emails toward sign-in', () => {
    expect(mapAuthError({ code: 'auth/email-already-in-use' })).toContain(
      'Sign in',
    )
  })

  it('gives a recoverable next step for unknown failures', () => {
    expect(mapAuthError({ code: 'auth/network-request-failed' })).toContain(
      'try again',
    )
  })
})
