## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.
## 2024-05-24 - [Remove Hardcoded JWT Secret]
**Vulnerability:** A hardcoded fallback string was used for JWT_SECRET in the authentication middleware.
**Learning:** Failing to supply a secure environment variable caused the application to silently fall back to a known, hardcoded secret, exposing the entire authentication system.
**Prevention:** Ensure required secrets do not have hardcoded defaults and explicitly throw an error on startup if they are missing.
