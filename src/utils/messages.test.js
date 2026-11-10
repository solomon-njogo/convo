import { describe, expect, it } from 'vitest'
import {
  MAX_MESSAGE_LENGTH,
  canSendMessage,
  conversationIdFor,
  formatMessageTimestamp,
  getComposerHint,
  isSentByCurrentUser,
} from './messages'

describe('canSendMessage', () => {
  it('rejects empty and whitespace-only drafts', () => {
    expect(canSendMessage('')).toBe(false)
    expect(canSendMessage('   ')).toBe(false)
    expect(canSendMessage('\n\t')).toBe(false)
  })

  it('accepts a normal Message draft', () => {
    expect(canSendMessage('Hello')).toBe(true)
    expect(canSendMessage('  Hello  ')).toBe(true)
  })

  it('rejects drafts over the max length after trim', () => {
    expect(canSendMessage('a'.repeat(MAX_MESSAGE_LENGTH))).toBe(true)
    expect(canSendMessage('a'.repeat(MAX_MESSAGE_LENGTH + 1))).toBe(false)
  })
})

describe('getComposerHint', () => {
  it('is silent for empty and valid drafts', () => {
    expect(getComposerHint('')).toBe(null)
    expect(getComposerHint('Hi')).toBe(null)
  })

  it('explains when the draft exceeds max length', () => {
    expect(getComposerHint('a'.repeat(MAX_MESSAGE_LENGTH + 1))).toBe(
      `Shorten your message to ${MAX_MESSAGE_LENGTH} characters or fewer`,
    )
  })
})

describe('formatMessageTimestamp', () => {
  it('shows Sending… while createdAt is pending', () => {
    expect(formatMessageTimestamp(null)).toBe('Sending…')
    expect(formatMessageTimestamp(undefined)).toBe('Sending…')
  })

  it('formats a Date as short locale time', () => {
    const date = new Date('2026-11-02T15:04:00')
    expect(formatMessageTimestamp(date, 'en-US')).toMatch(/3:04/)
  })

  it('supports Firestore-like toDate()', () => {
    const stamp = { toDate: () => new Date('2026-11-02T09:30:00') }
    expect(formatMessageTimestamp(stamp, 'en-US')).toMatch(/9:30/)
  })
})

describe('conversationIdFor', () => {
  it('is deterministic regardless of argument order', () => {
    expect(conversationIdFor('b', 'a')).toBe('a_b')
    expect(conversationIdFor('a', 'b')).toBe('a_b')
  })
})

describe('isSentByCurrentUser', () => {
  it('marks Messages from the signed-in person as sent', () => {
    expect(isSentByCurrentUser({ senderId: 'u1' }, 'u1')).toBe(true)
    expect(isSentByCurrentUser({ senderId: 'u2' }, 'u1')).toBe(false)
  })
})
