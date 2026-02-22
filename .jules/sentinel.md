# Sentinel's Journal

## 2025-02-23 - Critical IDOR and Auth Bypass in Post Creation

**Vulnerability:** Unauthenticated users could create posts, and authenticated users could create posts on behalf of any other user by simply providing a target `userId` in the request body. The endpoints were not protected by authentication middleware, and the controller logic blindly trusted the `userId` from the request.

**Learning:** This existed because `post.routes.js` lacked `authenticateToken` middleware on `POST /`. Additionally, the `createPost` controller used `req.body.userId` instead of deriving the user ID from the authenticated session (`req.user.id`). Furthermore, existing tests were broken and failed to cover this critical flow, allowing the vulnerability to persist unnoticed. The authentication middleware also had a mismatch in token payload expectations (`decoded.userId` vs `decoded.id`), which complicated verification.

**Prevention:**
1. Always apply authentication middleware to sensitive endpoints.
2. Never trust client-provided IDs for resource ownership/creation; always derive the user identity from the verified session/token (e.g., `req.user.id`).
3. Maintain rigorous integration tests that specifically target authorization boundaries (e.g., trying to access/modify resources of other users).
4. Ensure consistency between token generation (service) and verification (middleware).
