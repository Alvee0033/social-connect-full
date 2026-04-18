## 2024-05-24 - [IDOR in Post Creation and Missing Route Authentication]
**Vulnerability:** The `POST /api/posts` and `POST /api/posts/:id/react` endpoints lacked authentication middleware in the routes definition. Furthermore, the `createPost` controller implicitly trusted `req.body.userId`, allowing any user to potentially create posts masquerading as someone else (IDOR).
**Learning:** Controller logic alone is insufficient if the middleware protecting it is missing from the route. User-supplied identification data (like `userId` in the body) should never be trusted for actions linked to the authenticated user.
**Prevention:** Always verify that routes defining state-changing endpoints (POST, PUT, DELETE) have authentication middleware applied. Within controllers, always rely on `req.user.id` (set by the authentication middleware) to determine the user performing the action, rather than relying on the client to send a `userId`.

## 2024-05-18 - [Missing Authorization (IDOR) in Messages]
**Vulnerability:** The `sendMessage` endpoint lacked verification that the sender and receiver are friends, allowing any authenticated user to send messages to any other user.
**Learning:** IDOR vulnerabilities can exist not only on viewing endpoints but also on mutation endpoints when relationships (like friendships) are implicitly assumed but not verified.
**Prevention:** Always verify ownership or required relationship status (e.g., `Friendship` with `status: 'accepted'`) between the current user (`req.user.id`) and the target resource/user before executing an action.
