## 2024-05-15 - Hardcoded JWT Secret
**Vulnerability:** A hardcoded fallback JWT_SECRET exists in `backend/src/middleware/auth.middleware.js`.
**Learning:** Hardcoding secrets as fallbacks in production code is dangerous as it allows attackers to bypass authentication if environment variables fail to load.
**Prevention:** Always require secrets to be explicitly provided in environment configurations, failing startup if they are missing.
