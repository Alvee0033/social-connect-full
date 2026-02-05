# Sentinel Journal

## 2024-05-22 - Broken Access Control in Post Creation
**Vulnerability:** `POST /api/posts` allowed any user to create posts on behalf of others by specifying `userId` in the request body. The endpoint was also unauthenticated.
**Learning:** Controllers must explicitly rely on `req.user` (from auth middleware) for user identification, not request body parameters which can be manipulated.
**Prevention:** Apply `authenticateToken` middleware to all user-centric routes and use `req.user.id` in controllers. Audit controllers for `req.body.userId` usage.

## 2024-05-22 - Environment Variable Capture in Node.js Modules
**Vulnerability:** Hardcoded `JWT_SECRET` fallback and top-level capture of `process.env.JWT_SECRET` caused security risks and test failures.
**Learning:** `const SECRET = process.env.SECRET` at the top level of a module captures the value at *require* time. Test setups often set env vars *after* requiring the app (which requires the middleware), leading to the middleware using `undefined` or old values.
**Prevention:** Always access `process.env` variables inside functions (runtime) rather than at module scope (load time), or ensure environment is fully configured before any `require` calls.
