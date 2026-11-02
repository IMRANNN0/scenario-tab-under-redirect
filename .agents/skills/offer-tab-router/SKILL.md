---
name: offer-tab-router
description: Implement explicit user-initiated offer navigation with optional new tab and replacement of Prelander A by B, plus same-tab fallback. Use for routing, not automatic popups, verification or analytics definitions.
---

# Offer Tab Router

Own navigation requests and observable outcomes; a tab handle proves no offer/B view.
- Inspect authorized offer/B URLs and mode. Preserve tracker query parameters exactly unless documented mapping requires changes. Do not infer a production URL.
- Read [references/navigation.md](references/navigation.md), then adapt [assets/router.mjs](assets/router.mjs). Keep ordinary links where possible. The template uses HTTPS and same-origin B; HTTP is an explicit local-testing option.
- Open a tab only synchronously from trusted user activation after asynchronous verification. Request a fresh Continue when needed. Preserve modified clicks and browser choices. No timers, focus tricks, global click hijacks, repeated openings or blocker bypasses.
- Clearly disclose destination/behavior. Respect campaign/platform rules; this skill establishes no platform approval. Resolve any conflict with repository restrictions using actual scoped user authorization.
- Sever opener before external navigation. Navigate A to optional B only after obtaining an offer tab handle. The browser determines foreground/background behavior.
- When B is on a different origin, allow only the explicit approved B URL. For an approved A-originated B-load measurement, pass a fresh opaque handoff marker without changing that URL's origin or path; never copy offer tracker parameters to B without an approved mapping. Tracking interprets and consumes the marker.
- On blocked/failed opening, use ordinary same-tab offer navigation, with no B. On navigation exceptions expose an ordinary offer link/retry in the caller.
- Expose onRequested/onResult for optional tracking. Tracking owns the definition; failures must not stop navigation.
- Test actual URLs, tab counts, original destination, blocker fallback, no-B mode, modifiers, cancellation, navigation exceptions and broken responses.
Use funnel-qa browser and router-unit cases. Cross-origin destination success cannot be inferred from window.open alone.
