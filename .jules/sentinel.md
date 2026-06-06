## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.
## 2026-06-06 - [PII Leak in User Search]
**Vulnerability:** The `GET /api/users/search` endpoint in `user.routes.js` lacked authentication middleware, exposing user emails to unauthenticated requests.
**Learning:** Endpoints that return user information, especially PII like email addresses, must be explicitly protected, as Express routes are public by default.
**Prevention:** Apply `authenticateToken` middleware to all routes exposing user details unless they strictly need to be public (and even then, omit PII from the response).
