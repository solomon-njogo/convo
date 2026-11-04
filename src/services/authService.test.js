import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  deleteUser: vi.fn(),
  doc: vi.fn(() => 'profile-ref'),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
  setDoc: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  deleteUser: mocks.deleteUser,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signOut: mocks.signOut,
  updateProfile: mocks.updateProfile,
}))

vi.mock('firebase/firestore', () => ({
  doc: mocks.doc,
  runTransaction: mocks.runTransaction,
  serverTimestamp: mocks.serverTimestamp,
  setDoc: mocks.setDoc,
}))

vi.mock('../firebase/config', () => ({
  auth: 'auth',
  db: 'db',
}))

import { loginUser, logoutUser, registerUser } from './authService'

const permissionDenied = Object.assign(new Error('Permission denied'), {
  code: 'permission-denied',
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('authService profile failures', () => {
  it('keeps the newly created account signed in when profile creation is denied', async () => {
    const user = {
      uid: 'user-a',
      email: 'user-a@example.test',
      photoURL: null,
    }
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user })
    mocks.updateProfile.mockResolvedValue()
    mocks.setDoc.mockRejectedValue(permissionDenied)

    await expect(registerUser({
      email: user.email,
      password: 'password',
      displayName: 'User A',
    })).rejects.toBe(permissionDenied)

    expect(mocks.deleteUser).not.toHaveBeenCalled()
    expect(mocks.signOut).not.toHaveBeenCalled()
  })

  it('keeps the user signed in when login cannot restore a missing profile', async () => {
    const user = {
      uid: 'user-a',
      email: 'user-a@example.test',
      displayName: 'User A',
      photoURL: null,
    }
    mocks.signInWithEmailAndPassword.mockResolvedValue({ user })
    mocks.runTransaction.mockRejectedValue(permissionDenied)

    await expect(loginUser({
      email: user.email,
      password: 'password',
    })).rejects.toBe(permissionDenied)

    expect(mocks.signOut).not.toHaveBeenCalled()
  })

  it('still signs out when the user explicitly requests it', async () => {
    mocks.signOut.mockResolvedValue()

    await logoutUser()

    expect(mocks.signOut).toHaveBeenCalledWith('auth')
  })
})
