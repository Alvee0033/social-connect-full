## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.
## 2024-05-24 - [Unauthenticated Data Exposure on Search API]
**Vulnerability:** The `/api/users/search` endpoint was missing the `authenticateToken` middleware, allowing unauthenticated attackers to query and enumerate PII (user emails and names).
**Learning:** Routes that return PII or sensitive data must be actively protected. Without explicit middleware, any endpoint is public by default in Express.
**Prevention:** Establish a default-deny pattern where possible or consistently apply `authenticateToken` on any router group returning user data. Run automated integration tests validating 401s on endpoints without authorization headers.
