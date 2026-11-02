# Convo

Shared language for the real-time student chat app: who is signed in, how they register, and what identity the UI shows.

## Language

**User profile**:
The Firestore document at `users/{userId}` holding `displayName`, `email`, `photoURL`, and `createdAt` for a registered person.
_Avoid_: Account, client, badge

**Display name**:
The human-readable name stored on the User profile and collected only during Register.
_Avoid_: Username, handle, nickname (unless we later add a separate handle)

**Signed-in identity**:
Who the Navbar presents as present in this session — Display name when available, otherwise email.
_Avoid_: User badge, account chip, client

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
