## 2024-10-24 - Broken Auth Middleware & IDOR
**Vulnerability:** The `authenticateToken` middleware was looking for `decoded.userId` while `auth.service` signed tokens with `id`. This caused auth to fail silently (or be bypassed if routes didn't use it). `post.controller` relied on `req.body.userId`, allowing impersonation.
**Learning:** Mismatched token payloads between service (producer) and middleware (consumer) can lead to silent failures. In this case, the lack of route protection combined with controller insecurity created a full IDOR/Impersonation vulnerability.
**Prevention:** Use a shared constant or type definition for token payloads. Ensure integration tests cover the full auth flow (login -> use token -> protected resource) to catch mismatches.
