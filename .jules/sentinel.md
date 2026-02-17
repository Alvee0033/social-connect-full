## 2024-05-22 - Broken Authentication and IDOR in Post Creation
**Vulnerability:** The `createPost` endpoint allowed unauthenticated users to create posts and, due to mass assignment/IDOR, allowed spoofing the `userId` to post on behalf of any user.
**Learning:** Middleware bugs (incorrect JWT payload property access) can silently fail, leaving endpoints unprotected or broken. Also, relying on client-provided IDs in the request body for resource ownership is a critical IDOR risk.
**Prevention:**
1. Always enforce authentication on sensitive endpoints.
2. Never trust client input for user identity; always derive it from the validated authentication token (`req.user.id`).
3. Ensure middleware logic matches the token generation logic (e.g., `id` vs `userId`).
