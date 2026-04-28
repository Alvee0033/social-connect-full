## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.
## 2026-04-28 - [Missing Authentication on PII Endpoint]
**Vulnerability:** The `/api/users/search` endpoint returned user PII (including email addresses) and was unauthenticated.
**Learning:** In Express, routes are publicly accessible by default. Endpoints that process or return sensitive user data (PII) must be explicitly protected with authentication middleware to prevent unauthorized data exposure.
**Prevention:** Always verify that routes exposing user data or other sensitive resources implement the `authenticateToken` middleware. Treat endpoints returning user records with strict default-deny access controls.
