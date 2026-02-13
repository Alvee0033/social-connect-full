## 2025-05-15 - Missing Authentication and IDOR in Posts
**Vulnerability:** The `createPost` endpoint lacked authentication middleware and blindly trusted `req.body.userId`, allowing unauthenticated users to create posts and authenticated users to impersonate others (IDOR).
**Learning:** Middleware bugs (expecting `userId` instead of `id` in token) can lead to developers disabling or skipping auth checks entirely, leaving endpoints exposed. Always verify auth middleware works before relying on it.
**Prevention:**
1. Use `req.user.id` from a trusted auth middleware, never `req.body.userId` for resource creation.
2. Ensure auth middleware is applied to all sensitive routes.
3. Write negative tests (expect 401/403) to confirm security controls are active.
