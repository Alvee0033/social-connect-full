## 2024-05-18 - [Fix IDOR in Post Creation]
**Vulnerability:** IDOR (Insecure Direct Object Reference) in `createPost` where the API blindly trusted the `userId` passed in the `req.body`, allowing users to forge posts as any user. Also, a broken Auth middleware prevented successful authentication due to expecting `decoded.userId` when `decoded.id` was signed.
**Learning:** Auth tokens used the property `id`, but middleware verified against `userId`. Once fixed, `req.user.id` is available securely in controllers.
**Prevention:** Always extract user identity from `req.user.id` populated by the securely validated authentication middleware token rather than `req.body` parameters for resource creation.
