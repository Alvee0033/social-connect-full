## 2024-05-24 - IDOR in Post Creation
**Vulnerability:** Insecure Direct Object Reference (IDOR) in `createPost` controller allowed any authenticated user to create posts on behalf of another user by supplying a different `userId` in the request body.
**Learning:** Middleware (`authenticateToken`) provides the *identity* of the caller, but controllers must explicitly *use* that identity (`req.user.id`) instead of trusting user input (`req.body.userId`) for resource ownership.
**Prevention:**
1. Never accept `userId` or resource owner IDs from the request body for creation/update operations.
2. Always derive the owner ID from the trusted session/token (`req.user.id`).
3. Write negative tests that attempt to spoof ownership.
