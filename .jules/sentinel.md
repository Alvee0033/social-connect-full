## Sentinel Journal

## 2024-05-23 - Critical IDOR and Auth Bypass in Post Creation
**Vulnerability:** The `createPost` endpoint allowed any user to post as any other user by specifying `userId` in the request body. It also lacked authentication middleware entirely.
**Learning:** Middleware (`authenticateToken`) was present but unused in critical routes. Also, the middleware had a bug where it expected `decoded.userId` but the token generator signed `decoded.id`, causing auth to fail even when applied.
**Prevention:** Always use `req.user.id` from the auth token for resource creation. Verify that auth middleware is actually applied to routes. Ensure token payload structure matches what the middleware expects.
