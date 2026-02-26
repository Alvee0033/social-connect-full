## 2024-05-22 - Broken Auth Middleware Pattern
**Vulnerability:** Authentication middleware was checking for `decoded.userId` while tokens were signed with `id`, causing all valid tokens to be rejected or user lookup to fail silently if error handling was poor.
**Learning:** Discrepancy between JWT payload structure in service vs middleware caused silent auth failures.
**Prevention:** Ensure token generation and verification logic share a single source of truth for payload structure, or add integration tests that specifically verify the auth flow end-to-end.
