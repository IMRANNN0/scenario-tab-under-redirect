---
name: offer-tab-router
description: Implement the requested tab-under scenario where a user action opens an offer in a new tab and replaces original Prelander A with B, with same-tab fallback. Also support explicitly requested alternatives. Use for routing, not verification or analytics definitions.
---

# Offer Tab Router

Own navigation requests and observable outcomes; a tab handle proves no offer/B view.
- When asked to use this skill for the tab-under scenario, implement both outcomes from the same user action: request the offer in a new tab and replace original A with B. This is the default scenario, not merely an optional extra. Explicit user requests for another mode take precedence.
- Inspect authorized offer/B URLs and mode. Find B in the existing project or configuration; if it cannot be identified, prepare independent work and ask for it rather than silently keeping A or inventing a destination. Preserve tracker query parameters exactly unless documented mapping requires changes.
- Read [references/navigation.md](references/navigation.md), then adapt [assets/router.mjs](assets/router.mjs). The router requires B by default for new-tab mode; `originalTab: 'keep-a'` is an explicit opt-in for a separately requested offer-only scenario. Keep ordinary links where possible. The template uses HTTPS; HTTP is an explicit local-testing option.
- Open a tab only synchronously from trusted user activation after asynchronous verification. Request a fresh Continue when needed. Preserve modified clicks and browser choices. No timers, focus tricks, global click hijacks, repeated openings or blocker bypasses.
- Clearly disclose destination/behavior. Respect campaign/platform rules; this skill establishes no platform approval. Resolve any conflict with repository restrictions using actual scoped user authorization.
- Sever opener before external navigation. Replace A with B only after obtaining an offer tab handle. The browser determines foreground/background behavior.
- When B is on a different origin, allow only the explicit approved B URL. For an approved A-originated B-load measurement, pass a fresh opaque handoff marker without changing that URL's origin or path; never copy offer tracker parameters to B without an approved mapping. Tracking interprets and consumes the marker.
- On blocked/failed opening, use ordinary same-tab offer navigation, with no B. On navigation exceptions expose an ordinary offer link/retry in the caller.
- Expose onRequested/onResult for optional tracking. Tracking owns the definition; failures must not stop navigation.
- Test actual URLs and query parameters, exactly two tabs, the original tab showing B (including cross-origin B), blocker fallback, explicit no-B mode, modifiers, cancellation, navigation exceptions and broken responses. A new tab alone is not a passing A-to-B test.
Use funnel-qa browser and router-unit cases. Cross-origin destination success cannot be inferred from window.open alone.
