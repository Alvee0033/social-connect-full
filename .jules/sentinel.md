# Sentinel Journal - Security Learnings

## 2025-02-18 - IDOR Vulnerability in Post Creation
**Vulnerability:** The `POST /api/posts` endpoint allowed creating posts on behalf of any user by simply including a target `userId` in the request body. The endpoint lacked authentication middleware.
**Learning:** This existed because the controller trusted `req.body.userId` without verifying the requestor's identity, and the route definition omitted the `authenticateToken` middleware. Additionally, the authentication middleware was not robust enough to handle tokens signed with `id` instead of `userId`.
**Prevention:** Always apply authentication middleware to state-changing endpoints. Derive ownership/identity exclusively from the verified token (`req.user.id`) rather than user-supplied input. Ensure middleware and token generation logic are consistent (e.g., payload keys).
