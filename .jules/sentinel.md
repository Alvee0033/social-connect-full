## 2024-05-24 - IDOR in Post Creation
**Vulnerability:** The `createPost` endpoint accepted `userId` from the request body, allowing any authenticated user to create posts on behalf of others (IDOR).
**Learning:** Always verify user identity from the authentication token (`req.user.id`), never from request body parameters for resource ownership.
**Prevention:** Use `req.user.id` from `authenticateToken` middleware.

## 2024-05-24 - Auth Middleware Token Mismatch
**Vulnerability:** `auth.service.js` signed tokens with `{ id }`, but `auth.middleware.js` looked for `{ userId }`. This caused valid tokens to be rejected or fail user lookup.
**Learning:** Ensure consistency in JWT payload structure between generation and verification.
**Prevention:** Use standard claim names (e.g., `sub` or `id`) and verify them consistently.
