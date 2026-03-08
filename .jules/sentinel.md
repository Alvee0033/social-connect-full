## 2024-05-24 - [IDOR in Post Creation]
**Vulnerability:** In `backend/src/controllers/post.controller.js`, the `createPost` method extracted `userId` from `req.body` rather than relying on the authenticated user's ID. Additionally, the `createPost` and `reactToPost` routes in `backend/src/routes/post.routes.js` were missing the `authenticateToken` middleware, allowing unauthenticated requests to those endpoints and allowing any user to spoof a post on behalf of another user if they passed `userId` in the body.
**Learning:** Always verify that route endpoints requiring user context are protected by authentication middleware. Do not rely on client-provided data for identity determination when a reliable server-side authenticated identity (`req.user.id`) is available.
**Prevention:**
1. Retrieve `userId` from `req.user.id` instead of `req.body.userId`.
2. Apply `authenticateToken` middleware to all routes that require the user to be authenticated, such as creating or reacting to a post.
