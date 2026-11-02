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
npm install
npm install firebase
```

### Firebase

1. Create a project in the Firebase Console and register a Web App.
2. Enable **Authentication → Email/Password**.
3. Create a **Cloud Firestore** database.
4. Copy `.env.example` to `.env` and fill in your web config (Vite `VITE_` prefix):

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Do not commit `.env`. Firebase web config is not a security boundary—protect access with Authentication and Security Rules. Never put service-account keys in the frontend.

### Run

```bash
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## Project structure

```
src/
  components/     # Navbar, UserList, UserSearch, ChatWindow, MessageList, MessageInput
  pages/          # Login, Register, Chat
  context/        # AuthContext
  hooks/          # useMessages
  services/       # authService, chatService
  firebase/       # config.js
```

## Data model

| Collection / path | Purpose |
| --- | --- |
| `users/{userId}` | Profile: `displayName`, `email`, `photoURL`, `createdAt` |
| `conversations/{conversationId}` | `participants`, `lastMessage`, `updatedAt` |
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