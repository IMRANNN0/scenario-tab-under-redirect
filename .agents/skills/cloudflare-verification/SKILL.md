---
name: cloudflare-verification
description: Add or repair real Cloudflare Turnstile client and server validation with protected verified sessions and token lifecycle handling. Use for trusted challenge verification, not decorative swipe UI or general Cloudflare deployment.
---

# Cloudflare Verification

Own the challenge, mandatory Siteverify validation and trusted session lifecycle.
- Identify existing backend, secret manager, sitekey, expected action, exact hostname allowlist, frontend origins and verification-session TTL. Missing production inputs permit local template/testing work, not invented keys, widget creation or deployment.
- Read [references/integration.md](references/integration.md) and recheck its official sources for a real integration. Use the official widget through [assets/turnstile-client.mjs](assets/turnstile-client.mjs), not a copied/security-lookalike UI.
- Adapt [assets/verification-server.mjs](assets/verification-server.mjs) inside the backend. TURNSTILE_SECRET lives only in server environment/secret storage. Require strict success === true, expected action and allowed hostname. Reject missing/oversized/expired/replayed tokens and malformed/upstream failures. Bound retries/timeouts and preserve one idempotency key for retries of a token validation.
- After acceptance, create an opaque random session ID. Keep status/expiry server-side; use host-only Secure HttpOnly SameSite cookies in production, rotate IDs and revoke state on logout. The memory store is local-only. Production needs a shared TTL store, rate limiting and application origin/CSRF controls. Never log secrets/tokens.
- Skip a new challenge only while the backend confirms the session. q=yes, cookie presence and swipe completion grant no trust. Confirm the session cookie round trip; fail closed with disabled storage. Verification TTL is independent of recognition-cookie retention.
- Expose success/failure/expired/timeout/retry/unavailable states. Reset/remove the correct widget. By default require a fresh explicit Continue after verification. When the user explicitly requests same-tab continuation after an initial CTA, allow it only after server verification and the cookie round trip, and cancel it if the visitor dismisses the dialog. Never automatically open a new tab from an asynchronous callback.
- For gaming modal presentation, follow the user's reference and repository preferences: authentic game media, centered CTA and real widget can coexist. A verification-status CTA must never falsely imply success or navigate before server validation. Preserve dismiss/retry and the official widget, not an imitation of a screenshot.
- Test forgery, rotation, expiry, revocation, origin denial, hostname/action mismatch, timeout and replay. Distinguish mocks, official dummy-key tests and production acceptance.
Run `node --test assets/tests/verification.test.mjs`. Use funnel-qa for UI/integration. Do not add tracking or swipe to standalone verification work. A passing challenge is not a conversion or absolute humanity guarantee.
