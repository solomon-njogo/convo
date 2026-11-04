# Person A owns auth UI, not auth plumbing

Person A delivers Login, Register, and the signed-in Navbar chrome (Signed-in identity + Sign-out control), including controlled forms, Client validation, Auth-failure message mapping, and per-form submit locks. AuthContext, `authService`, User-profile creation after Register, `onAuthStateChanged`, and route gating after sign-out stay with the auth/routing owner so UI and Firebase plumbing can land in parallel without one person blocking the other.
