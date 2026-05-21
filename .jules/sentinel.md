## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.
## 2026-05-21 - [Broken Access Control in Messaging]
**Vulnerability:** The `sendMessage` controller in `backend/src/controllers/message.controller.js` allowed any user to send a message to any other user, regardless of their friendship status.
**Learning:** Missing authorization checks in direct messaging features can lead to spam and abuse. We must verify that a valid relationship exists before allowing users to interact directly.
**Prevention:** Ensure that all user-to-user interaction endpoints explicitly verify the authorization context (e.g., 'accepted' friendship status) before executing the action.
