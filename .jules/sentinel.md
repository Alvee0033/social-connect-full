## 2026-01-26 - Critical IDOR in Post Creation
**Vulnerability:** Unauthenticated users could create posts, and authenticated users could impersonate others by supplying a `userId` in the request body (IDOR).
**Learning:** The `post.routes.js` lacked any authentication middleware, and the controller blindly trusted `req.body.userId` instead of deriving identity from the session/token. This suggests a pattern of manual association handling without verification.
**Prevention:** Always apply authentication middleware to state-changing routes. Never accept ownership IDs (like `userId`) from the request body for created resources; always derive them from the trusted authentication token (`req.user.id`).
