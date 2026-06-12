## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.

## 2026-06-12 - [Authentication Middleware Token Bypass/Failure]
**Vulnerability:** The authentication middleware was incorrectly looking for `decoded.userId` instead of `decoded.id`, which is how the token was actually signed. This would result in the middleware returning 'User not found' on every valid token, or worse, if a token maliciously crafted with a `userId` bypass was used.
**Learning:** Always ensure the payload fields accessed during JWT verification match the fields that were signed during JWT generation.
**Prevention:** Add unit/integration tests that actually exercise authenticated routes. Tests for registration and login only check that a token is issued, but you must also test endpoints that consume the token.
