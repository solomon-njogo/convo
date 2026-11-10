import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  deleteUser: vi.fn(),
  doc: vi.fn(() => 'profile-ref'),
  getDoc: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
  setDoc: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  updateDoc: vi.fn(),
  updateProfile: vi.fn(),
  authCurrentUser: null,
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
  getDoc: mocks.getDoc,
  runTransaction: mocks.runTransaction,
  serverTimestamp: mocks.serverTimestamp,
  setDoc: mocks.setDoc,
  updateDoc: mocks.updateDoc,
}))

vi.mock('../firebase/config', () => {
  const auth = {
    get currentUser() {
      return mocks.authCurrentUser
    },
  }
  return { auth, db: 'db' }
})

import {
  loginUser,
  logoutUser,
  registerUser,
  updateDisplayName,
} from './authService'

const permissionDenied = Object.assign(new Error('Permission denied'), {
  code: 'permission-denied',
})

beforeEach(() => {
  vi.clearAllMocks()
  mocks.authCurrentUser = null
  mocks.doc.mockReturnValue('profile-ref')
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

    expect(mocks.signOut).toHaveBeenCalledTimes(1)
  })
})

describe('authService updateDisplayName', () => {
  it('updates Auth and Firestore, then returns the reloaded user', async () => {
    const createdAt = { seconds: 1 }
    const user = {
      uid: 'user-a',
      email: 'user-a@example.test',
      displayName: 'Old Name',
      photoURL: null,
      reload: vi.fn(async () => {
        user.displayName = 'New Name'
      }),
    }
    mocks.authCurrentUser = user
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        displayName: 'Old Name',
        email: 'user-a@example.test',
        photoURL: null,
        createdAt,
      }),
    })
    mocks.updateProfile.mockResolvedValue()
    mocks.updateDoc.mockResolvedValue()

    const result = await updateDisplayName('  New Name  ')

    expect(mocks.updateProfile).toHaveBeenCalledWith(user, { displayName: 'New Name' })
    expect(mocks.updateDoc).toHaveBeenCalledWith('profile-ref', {
      displayName: 'New Name',
      email: 'user-a@example.test',
      photoURL: null,
      createdAt,
    })
    expect(user.reload).toHaveBeenCalled()
    expect(result).toBe(user)
    expect(mocks.updateProfile.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.updateDoc.mock.invocationCallOrder[0],
    )
  })

  it('rejects empty display names before writing', async () => {
    mocks.authCurrentUser = {
      uid: 'user-a',
      email: 'user-a@example.test',
      reload: vi.fn(),
    }

    await expect(updateDisplayName('   ')).rejects.toThrow(
      'Enter a display name classmates will recognize',
    )
    expect(mocks.getDoc).not.toHaveBeenCalled()
    expect(mocks.updateProfile).not.toHaveBeenCalled()
    expect(mocks.updateDoc).not.toHaveBeenCalled()
  })

  it('surfaces Firestore permission failures after Auth profile update', async () => {
    const user = {
      uid: 'user-a',
      email: 'user-a@example.test',
      displayName: 'Old Name',
      photoURL: null,
      reload: vi.fn(),
    }
    mocks.authCurrentUser = user
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({
        displayName: 'Old Name',
        email: 'user-a@example.test',
        photoURL: null,
        createdAt: { seconds: 1 },
      }),
    })
    mocks.updateProfile.mockResolvedValue()
    mocks.updateDoc.mockRejectedValue(permissionDenied)

    await expect(updateDisplayName('New Name')).rejects.toBe(permissionDenied)
    expect(mocks.updateProfile).toHaveBeenCalled()
    expect(user.reload).not.toHaveBeenCalled()
  })
})
