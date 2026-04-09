## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.
## 2024-05-24 - [Unauthenticated PII Exposure on User Search Endpoint]
**Vulnerability:** The `GET /api/users/search` endpoint in `user.routes.js` lacked authentication.
**Learning:** Endpoints that return Personally Identifiable Information (PII), such as email addresses, can be easily scraped if left unprotected. By default, new routes in Express are public unless middleware is explicitly applied.
**Prevention:** Always apply the `authenticateToken` middleware to routes that return user data, unless the route is explicitly designed to be public (like login/register).
