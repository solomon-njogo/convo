# Convo

Shared language for the real-time student chat app: who is signed in, how they find each other, and what identity the UI shows.

## Language

**User profile**:
The Firestore document at `users/{userId}` holding `displayName`, `email`, `photoURL`, and `createdAt` for a registered person. The document id is the same stable id as the person's Auth uid.
_Avoid_: Account, client, badge, currentUser

**Display name**:
The human-readable name stored on the User profile and collected only during Register.
_Avoid_: Username, handle, nickname (unless we later add a separate handle)

**Signed-in identity**:
Who the Navbar presents as present in this session — Display name when available, otherwise email.
_Avoid_: User badge, account chip, client, currentUser

**Peer**:
Another person's User profile shown in the directory — everyone except the signed-in person.
_Avoid_: Contact, friend, active user, other user

**Selected peer**:
The single Peer chosen as the other participant for the chat pane.
_Avoid_: Active user, selected conversation, active chat partner

**Peer directory**:
The sidebar list of Peers available to select — not an inbox of existing conversations.
_Avoid_: User list (as a product concept), contacts, conversation list, inbox

**Peer search**:
Filtering the Peer directory by a case-insensitive substring of Display name or email; the row still leads with Display name.
_Avoid_: User query, find friends, global search

**Conversation**:
A chat between the signed-in person and exactly one Selected peer. It exists only after the first successful message send — selecting a Peer alone does not create it.
_Avoid_: Thread, room, channel, chat session (as the stored entity)

**Register**:
Creating Firebase Auth credentials plus a User profile. The Register form collects Display name, email, password, and a confirm-password field (Client validation only; confirm-password is not stored).
_Avoid_: Sign up, create account (prefer Register in UI copy)

**Login**:
Signing in with email and password only; does not collect or change Display name.
_Avoid_: Sign in (UI may say “Sign in” as a button label; the page/route concept is Login)

**Client validation**:
Checks the UI runs before submit — required fields, email format, minimum password length — shown near the fields that failed.
_Avoid_: Auth error, generic “Error”

**Auth failure**:
A rejected Login or Register attempt after submit (duplicate email, wrong password, network) shown as a form-level message.
_Avoid_: Validation error, toast-only silent failure

**Sign-out**:
Ending the signed-in session via the auth owner’s `signOut`; the auth/routing gate returns the UI to Login.
_Avoid_: Logout as the primary term in docs (button label may still say “Sign out”)
