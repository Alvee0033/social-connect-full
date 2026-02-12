# Sentinel Journal 🛡️

## 2024-05-23 - IDOR in Post Creation
**Vulnerability:** The `createPost` endpoint allowed unauthenticated users to create posts and authenticated users to create posts on behalf of other users (IDOR) by supplying an arbitrary `userId` in the request body.
**Learning:** Trusting `req.body` for sensitive fields like `userId` without verification is a critical flaw. Also, the authentication middleware was missing from the route entirely.
**Prevention:** Always apply authentication middleware to state-changing routes. Use `req.user.id` (populated by middleware) to determine the resource owner, never `req.body.userId`.

## 2024-05-23 - Broken Authentication Middleware
**Vulnerability:** The authentication middleware was checking `decoded.userId` but the token was signed with `{ id }`, causing authentication to fail silently or behave unpredictably. It also had a hardcoded fallback secret.
**Learning:** Discrepancies between token signing and verification logic can completely break auth. Hardcoded secrets in code are a major risk.
**Prevention:** Use consistent payload structures (e.g., standardizing on `id` or `sub`). Ensure `JWT_SECRET` is mandatory in the environment and fail fast if missing.
