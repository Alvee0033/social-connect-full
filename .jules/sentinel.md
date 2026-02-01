## 2024-05-22 - Unauthenticated Post Creation & User Impersonation
**Vulnerability:** The `POST /api/posts` endpoint was completely public and relied on `req.body.userId` to assign authorship. This allowed any user (or unauthenticated guest) to create posts on behalf of any other user.
**Learning:** Middleware application must be verified for every route. Trusting client-side `userId` in `req.body` is a classic IDOR/impersonation pattern. Authentication middleware must be tested to ensure the token payload matches what the middleware expects (`id` vs `userId`).
**Prevention:**
1. Always apply authentication middleware to sensitive routes.
2. Never use `req.body.userId` for sensitive operations; use `req.user.id` from the validated token.
3. Write security regression tests that specifically attempt to bypass authentication and impersonate users.
