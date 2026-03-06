## 2025-03-06 - [Sentinel] Fix IDOR in Post Creation

**Vulnerability:** The `POST /api/posts` endpoint accepted `userId` from the request body (`req.body.userId`) and did not require authentication. This allowed any user (or unauthenticated actor) to create a post appearing to be from any other user (Insecure Direct Object Reference / IDOR).

**Learning:** When creating records that are tied to a user, the application must extract the user identifier from the trusted authentication token (`req.user.id`) populated by the authentication middleware, rather than trusting client-provided data. Furthermore, sensitive endpoints modifying state must be protected by authentication middleware.

**Prevention:** Always use `req.user.id` for the authenticated context instead of payload parameters like `req.body.userId`. Apply authentication middleware (`authenticateToken`) globally or to all mutating routes by default.
