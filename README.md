# Convo — Real-Time Chat with React & Firebase

DST4010 Fall 2026 group project. A small messaging app for students: register, sign in, find another user, and exchange messages that update in real time—no page refresh.

React powers the UI. Firebase Authentication and Cloud Firestore handle identity, storage, and live updates.

## Features

- **Authentication** — Register, sign in, sign out; session persists after refresh
- **User directory** — List and search registered users; open or start a conversation
- **Messaging** — Send/receive text with sender, timestamp, and sent/received alignment
- **Persistence** — Messages remain available after reload
- **Real-time** — New messages appear for the other user without a manual refresh
- **UX** — Responsive layout, validation, loading/empty states, readable errors
- **Security** — Firestore rules so only conversation participants can read or send

## Tech stack

- React (Vite)
- Firebase Authentication (Email/Password)
- Cloud Firestore (real-time listeners)

## Requirements

- Node.js LTS and npm
- A modern browser
- A Google account for the [Firebase Console](https://console.firebase.google.com/)
- Git (recommended)

## Setup

```bash
npm ci
```

### Firebase

1. Create a project in the Firebase Console and register a Web App.
2. Enable **Authentication → Email/Password**.
3. Create a **Cloud Firestore** database.
4. Invite the other collaborator as an Editor from Project Settings → Users
   and permissions.
5. Copy `.env.example` to `.env` and fill in your web config. In PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

6. Publish the repository's `firestore.rules` to the project before testing
   Firestore reads or writes.

Do not commit `.env`. Firebase web config is not a security boundary—protect access with Authentication and Security Rules. Never put service-account keys in the frontend.

### Run

```bash
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`, and
`npm test` for unit tests.
Run the Firestore rules test suite against the local emulator with
`npm run test:rules`; Java is required for the emulator. This uses a demo
project ID and does not require the shared project's credentials.

The Firebase integration expects these exports and shapes:

- `useAuth()` exposes `user`, `currentUser`, `loading`, `error`, `login`,
  `register`, and `signOut`. `user` is the Firebase Auth user.
- `registerUser({ email, password, displayName })` creates the Auth account and
  corresponding `users/{uid}` profile.
- `loginUser({ email, password })` resolves to a Firebase `UserCredential`.
- `getAllUsers(currentUserId)` returns user profiles excluding the caller;
  `subscribeToUsers` is the real-time variant.
- `usePeers()` exposes `{ peers, status, error, retry }`; each peer has `id`,
  `displayName`, `email`, and `photoURL`.
- `getConversationId(uid1, uid2)` uses sorted UIDs joined by `_`;
  `getOrCreateConversation(uid1, uid2)` resolves to that stable ID.
- `findExistingConversationId(currentUserId, peerId)` resolves to the existing
  conversation ID or `null` without creating an empty conversation.
- Selecting a Peer only reads an existing conversation; the first successful
  `sendMessageToPeer({ currentUserId, peerId, text })` creates its conversation
  and message together.
- `sendMessage(conversationId, senderId, text)` atomically creates the message
  and updates the conversation preview and timestamp.
- `useMessages(conversationId)` returns `{ messages, loading, error }` and
  releases its Firestore listener when the conversation changes or unmounts.

## Project structure

```
src/
  components/     # Navbar, UserList, UserSearch, ChatWindow, MessageList, MessageInput
  pages/          # Login, Register, Chat
  context/        # AuthContext, AuthProvider
  hooks/          # useMessages
  services/       # authService, chatService
  firebase/       # config.js
```

## Data model

| Collection / path | Purpose |
| --- | --- |
| `users/{userId}` | Profile: `displayName`, `email`, `photoURL`, `createdAt` |
| `conversations/{conversationId}` | `participants`, `createdAt`, `lastMessage`, `updatedAt` |
| `conversations/{conversationId}/messages/{messageId}` | `senderId`, `text`, `createdAt` |

Use server timestamps for message creation and conversation updates. Unsubscribe from real-time listeners when the conversation changes or a component unmounts.

## Security

Firestore rules must match the schema: require auth; allow conversation/message access only for participants; require `senderId === request.auth.uid` on create; validate fields and text length. Do not deploy open rules (`allow read, write: if true`). UI checks are not authorization.

## Design system

Canonical tokens and component contracts live in [`docs/convo.design-system.json`](docs/convo.design-system.json). Foundation color, type, spacing, radius, and motion are inherited from [`docs/studynt.design-system.json`](docs/studynt.design-system.json). CSS maps to `src/styles/tokens.css` and `src/styles/components.css`.

## Docs

Course handout: [`docs/React_Firebase_Chat_App - Project 1.pdf`](docs/React_Firebase_Chat_App%20-%20Project%201.pdf)


Developed by:
Solomon Njogo
Nelson Mwangi