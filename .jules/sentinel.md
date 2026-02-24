## 2024-05-23 - JWT Payload Mismatch
**Vulnerability:** Authentication Middleware Mismatch
**Learning:** The auth service generated tokens with `id` payload, but middleware checked for `userId`. This meant valid tokens were rejected or potentially mishandled.
**Prevention:** Ensure strict contract between token issuer and consumer. Middleware now accepts both `id` and `userId` to be robust.
