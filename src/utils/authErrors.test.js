import { describe, expect, it } from 'vitest'
import { mapAuthError } from './authErrors'

describe('mapAuthError', () => {
  it('explains how to resolve Firestore profile permission failures', () => {
    const error = new Error('Could not create the user profile.', {
      cause: { code: 'permission-denied' },
    })

    expect(mapAuthError(error)).toContain('Publish firestore.rules')
  })

  it('finds Firebase errors wrapped in an AggregateError', () => {
    const error = new AggregateError(
      [{ code: 'permission-denied' }, new Error('Cleanup failed')],
      'Registration cleanup failed',
    )

    expect(mapAuthError(error)).toContain('Publish firestore.rules')
  })

  it('keeps invalid credentials distinct from Firestore failures', () => {
    expect(mapAuthError({ code: 'auth/invalid-credential' })).toBe(
      'Incorrect email or password',
    )
  })
})
