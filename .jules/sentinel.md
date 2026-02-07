## 2024-05-22 - Broken Authentication and IDOR in Post Creation
**Vulnerability:** The `createPost` endpoint relied on `req.body.userId` for authorship and lacked authentication middleware, allowing any user (including unauthenticated ones) to post as any other user.
**Learning:** Controllers must not trust client-provided IDs for sensitive fields like authorship. The absence of global or route-specific auth middleware on new features is a common oversight.
**Prevention:** Enforce `authenticateToken` on all non-public routes. Use `req.user.id` from the decoded token for resource ownership.
