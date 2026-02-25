## 2024-05-23 - Critical IDOR in Post Creation
**Vulnerability:** The `POST /api/posts` endpoint was unauthenticated and the controller trusted `req.body.userId`, allowing any user to create posts on behalf of any other user (IDOR).
**Learning:** This existed due to a lack of authentication middleware on the route and the controller relying on client-provided user ID instead of the authenticated session. Additionally, a mismatch in JWT payload keys (`id` vs `userId`) between `auth.service.js` and `auth.middleware.js` would have broken authentication if it were applied.
**Prevention:**
1. Always apply authentication middleware to state-changing endpoints.
2. Derive user identity solely from the validated token (`req.user.id`), never from `req.body` or `req.query`.
3. Standardize JWT payload structure and use shared constants or types to prevent key mismatches.
