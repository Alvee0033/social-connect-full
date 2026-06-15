## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.

## 2026-06-15 - [PII Exposure in Search Endpoint]
**Vulnerability:** The `GET /search` user endpoint lacked authentication and returned user email addresses, allowing unauthorized email enumeration and exposing PII.
**Learning:** Default visibility in search APIs easily exposes sensitive information if attributes aren't explicitly filtered. Testing endpoints with unauthenticated users and different attribute combinations is necessary.
**Prevention:** Apply `authenticateToken` middleware to all endpoints handling user data, explicitly specify safe attributes to return in queries (e.g., exclude `email`), and use generic error messages instead of leaking database or internal error details.
