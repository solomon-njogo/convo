import { readFileSync } from 'node:fs'
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  it,
} from 'vitest'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'

const projectId = 'demo-convo-rules'
const conversationId = 'user-a_user-b'
let testEnvironment

beforeAll(async () => {
  testEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8'),
    },
  })
})

beforeEach(async () => {
  await testEnvironment.clearFirestore()
})

afterAll(async () => {
  await testEnvironment.cleanup()
})

async function seedConversation() {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'conversations', conversationId), {
      participants: ['user-a', 'user-b'],
      createdAt: new Date(),
      lastMessage: 'Existing message',
      updatedAt: new Date(),
    })
    await setDoc(
      doc(context.firestore(), 'conversations', conversationId, 'messages', 'existing'),
      {
        senderId: 'user-a',
        text: 'Existing message',
        createdAt: new Date(),
      },
    )
  })
}

describe('Firestore security rules', () => {
  it('reject unauthenticated profile, conversation, and message reads', async () => {
    const firestore = testEnvironment.unauthenticatedContext().firestore()
    await seedConversation()

    await assertFails(getDocs(collection(firestore, 'users')))
    await assertFails(getDoc(doc(firestore, 'conversations', conversationId)))
    await assertFails(
      getDoc(doc(firestore, 'conversations', conversationId, 'messages', 'existing')),
    )
    await assertFails(
      setDoc(doc(firestore, 'users', 'user-c'), {
        displayName: 'Unauthenticated',
        email: 'user-c@example.test',
        photoURL: null,
        createdAt: serverTimestamp(),
      }),
    )
    await assertFails(
      setDoc(doc(firestore, 'conversations', 'user-a_user-c'), {
        participants: ['user-a', 'user-c'],
        createdAt: serverTimestamp(),
        lastMessage: null,
        updatedAt: serverTimestamp(),
      }),
    )
  })

  it('reject reads of conversations and messages by non-participants', async () => {
    await seedConversation()
    const firestore = testEnvironment.authenticatedContext('user-c').firestore()

    await assertFails(getDoc(doc(firestore, 'conversations', conversationId)))
    await assertFails(
      getDoc(doc(firestore, 'conversations', conversationId, 'messages', 'existing')),
    )
  })

  it('rejects forged sender IDs', async () => {
    await seedConversation()
    const firestore = testEnvironment.authenticatedContext('user-a').firestore()

    await assertFails(
      setDoc(
        doc(firestore, 'conversations', conversationId, 'messages', 'forged'),
        {
          senderId: 'user-c',
          text: 'Forged sender',
          createdAt: serverTimestamp(),
        },
      ),
    )
  })

  it('rejects blank and over-limit messages', async () => {
    await seedConversation()
    const firestore = testEnvironment.authenticatedContext('user-a').firestore()
    const messages = collection(firestore, 'conversations', conversationId, 'messages')

    await assertFails(
      setDoc(doc(messages, 'blank'), {
        senderId: 'user-a',
        text: ' \n\t ',
        createdAt: serverTimestamp(),
      }),
    )
    await assertFails(
      setDoc(doc(messages, 'too-long'), {
        senderId: 'user-a',
        text: 'x'.repeat(2001),
        createdAt: serverTimestamp(),
      }),
    )
  })

  it('rejects participant changes after conversation creation', async () => {
    await seedConversation()
    const firestore = testEnvironment.authenticatedContext('user-a').firestore()

    await assertFails(
      updateDoc(doc(firestore, 'conversations', conversationId), {
        participants: ['user-a', 'user-c'],
      }),
    )
  })

  it('allows a participant to create a valid message and update conversation metadata', async () => {
    await seedConversation()
    const firestore = testEnvironment.authenticatedContext('user-a').firestore()
    const batch = writeBatch(firestore)
    batch.set(doc(firestore, 'conversations', conversationId, 'messages', 'valid'), {
      senderId: 'user-a',
      text: 'Hello',
      createdAt: serverTimestamp(),
    })
    batch.update(doc(firestore, 'conversations', conversationId), {
      lastMessage: 'Hello',
      updatedAt: serverTimestamp(),
    })

    await assertSucceeds(batch.commit())
  })

  it('allows the first message to create its deterministic conversation atomically', async () => {
    const firestore = testEnvironment.authenticatedContext('user-a').firestore()
    const newConversationId = 'user-a_user-c'
    const batch = writeBatch(firestore)
    batch.set(doc(firestore, 'conversations', newConversationId), {
      participants: ['user-a', 'user-c'],
      createdAt: serverTimestamp(),
      lastMessage: 'First message',
      updatedAt: serverTimestamp(),
    })
    batch.set(
      doc(firestore, 'conversations', newConversationId, 'messages', 'first'),
      {
        senderId: 'user-a',
        text: 'First message',
        createdAt: serverTimestamp(),
      },
    )

    await assertSucceeds(batch.commit())
  })
})
