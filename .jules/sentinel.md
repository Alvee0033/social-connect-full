## 2024-03-15 - [CRITICAL: Insecure Direct Object Reference (IDOR) in Post Creation]
**Vulnerability:** The `createPost` endpoint allowed any user to specify the `userId` in the request body, bypassing authentication checks and allowing users to impersonate others when creating a post. Furthermore, the `post.routes.js` endpoints did not have `authenticateToken` enforced.
**Learning:** Never trust client-provided IDs for actions that are authenticated. Always extract the actor's identity from a verified secure context, such as a JWT payload after signature verification. Missing route-level middleware compounds the problem.
**Prevention:**
1. Always enforce authentication (`authenticateToken` middleware) on mutating actions (`POST`, `PUT`, `DELETE`).
2. Always extract the user identifier (`userId`) from the verified token context (`req.user.id`) and not from the incoming `req.body`.
