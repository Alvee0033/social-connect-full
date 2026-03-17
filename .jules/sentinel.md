
## 2024-05-18 - [Fix IDOR in Post Creation]
**Vulnerability:** The `POST /api/posts` endpoint was missing authentication, and the controller allowed users to specify the `userId` of the post creator in the request body. This allowed an attacker to create posts on behalf of any other user (Insecure Direct Object Reference).
**Learning:** Never trust the client to provide the user ID for actions performed by the authenticated user. Always extract the user identity from the verified session or token (e.g., `req.user.id`).
**Prevention:** Ensure all state-changing endpoints are protected by authentication middleware (`authenticateToken`). In controllers, always use `req.user.id` instead of `req.body.userId` when associating a newly created resource with the acting user.
