## 2026-04-02 - [Unauthenticated PII Enumeration on User Search Endpoint]
**Vulnerability:** The `/api/users/search` endpoint was missing authentication, allowing unauthenticated users to query and enumerate PII (emails, display names).
**Learning:** Endpoints that return PII or sensitive data must explicitly require authentication. By default, Express routes are public unless middleware is applied.
**Prevention:** Always verify that routes defining endpoints that return sensitive user data have authentication middleware applied. Add automated tests to ensure unauthenticated requests to these endpoints are rejected.

## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.