## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.

## 2024-05-18 - [Hardcoded JWT Secret and Auth Bypass Risk]
**Vulnerability:** The authentication middleware used a hardcoded fallback for `JWT_SECRET` ('your-super-secret-jwt-key-change-in-production') and attempted to read `decoded.userId` when tokens were signed with `id`.
**Learning:** Hardcoding secrets as fallbacks compromises any environment where the environment variable isn't explicitly set. Inconsistent token payload keys between issuance and verification lead to silent authentication failures or bypasses if not properly handled.
**Prevention:** Always fail fast and securely (e.g., throwing an error or returning 500) if critical configuration like `JWT_SECRET` is missing. Ensure consistency between token generation (`jwt.sign`) and extraction logic.
