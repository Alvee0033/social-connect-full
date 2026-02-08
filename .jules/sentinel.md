## 2026-01-26 - [Auth Bypass & IDOR in Post Creation]
**Vulnerability:** Unauthenticated users could create posts, and authenticated users could create posts on behalf of others by supplying `userId` in the request body.
**Learning:** Reliance on `req.body.userId` without verification against the authenticated user token is a critical flaw. Also, missing authentication middleware on sensitive routes.
**Prevention:** Always use `req.user.id` from the verified token for resource ownership. Apply authentication middleware to all state-changing routes.
