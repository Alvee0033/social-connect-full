## 2025-05-27 - [CRITICAL] IDOR and Broken Authentication Middleware

**Vulnerability:**
The application allowed post creation without authentication (missing `authenticateToken`) and relied on `req.body.userId` (IDOR), allowing impersonation. Furthermore, the `authenticateToken` middleware was broken as it expected `userId` in the token payload, but `auth.service.js` signed tokens with `id`.

**Learning:**
Simply adding authentication middleware would have broken the application because the middleware logic was flawed and untested against real tokens. The IDOR vulnerability was masked by the lack of auth enforcement. Existing tests were flawed (`api.test.js`) or insufficient (`security.test.js` was missing).

**Prevention:**
1.  Always use `req.user.id` from trusted middleware for resource ownership.
2.  Ensure token payload keys (`id`) match middleware expectations (`userId` vs `id`).
3.  Implement dedicated security tests (`security.test.js`) to verify vulnerability fixes and prevent regression.
