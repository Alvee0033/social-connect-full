## 2024-05-22 - Broken Auth Middleware & IDOR
**Vulnerability:** Authentication middleware was checking `decoded.userId` but the token contained `id`, resulting in failed user lookups. Critically, it was NOT used on post routes, allowing unauthenticated post creation. The controller also trusted `req.body.userId`, allowing impersonation.
**Learning:** The disconnect between token generation and verification suggests a lack of integration testing for the auth flow. The missing middleware on routes indicates a "default open" approach.
**Prevention:** Use a shared constant or type definition for JWT payloads. Adopt a "default secure" router pattern where auth is applied globally or by default. Always verify `req.user` in controllers instead of trusting `req.body`.
