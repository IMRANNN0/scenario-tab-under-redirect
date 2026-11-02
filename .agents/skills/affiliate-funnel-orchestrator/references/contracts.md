# Component integration contracts

## Inputs and scope
Use approved configuration for target pages, offer/B URL, event spelling, payload, eligibility, actual CMP decisions, actual Pixel/GTM IDs and production Turnstile values. [funnel-config.example.json](../assets/funnel-config.example.json) is an input worksheet, not an automatically loaded production config. Null/missing values are not deployable defaults. Follow the target repository's actual AGENTS.md and approved assets; do not transplant this repository's offer taxonomy or Windows-only choice into every project.

## Responsibilities
- cookie-manager owns optional browser recognition/preferences; client values are untrusted.
- cloudflare-verification owns trusted state and session expiry, server-side.
- swipe-interaction returns {event,source} or cancel; it grants no trust.
- offer-tab-router returns the navigation-request outcome from the final user activation.
- gotooffer-tracking owns the one trigger/dispatch owner and stable event ID.
- funnel-qa owns evidence. The orchestrator composes without duplicating those responsibilities.

## State and journey
Traffic -> A -> CTA_Click -> GET server session.
Unverified -> official Turnstile -> POST backend -> Siteverify strict success/action/hostname -> server store -> protected cookie -> confirm cookie round trip.
Verified session -> skip challenge while valid.
Then show explicit Continue/swipe+button -> request offer navigation and dispatch one defined action event.
The reference definition uses offer_navigation_requested and eventName Go2Offer. It measures an attempt, not receipt/view/installation/purchase. A blocked popup with same-tab fallback is still a request. Navigation exceptions must be separately reported. If another definition is approved, change the contract and tests together.
Optional new tab -> original requests B. B views are independent; neither opening nor B proves active viewing. Do not dispatch the same Go2Offer from B load.

## Data
Go2Offer record: { event: configuredName, event_id: stableId, ...approvedOfferFields }.
The browser's direct Meta eventID and a separately implemented CAPI event_id must reuse this logical action's ID. Exactly-once delivery across tabs/workers is not promised by the supplied in-memory ledger.
Do not send session secrets, Turnstile tokens, cookie contents or unnecessary personal data as event parameters.

## Runnable reference
The example server binds only 127.0.0.1 and serves an allowlisted set of files, not the repository. A programmatic testing:true option is for QA only, with conspicuous fixture labels. The CLI path requires real environment inputs and has no environment flag that bypasses verification.
Set TURNSTILE_SITEKEY, TURNSTILE_SECRET and OFFER_URL; use LOCAL_DEMO=1 only to replace the destination with a local labelled test offer. It does not bypass Turnstile.
Run: node affiliate-funnel-orchestrator/assets/reference-funnel/server.mjs
The harness intentionally uses plain localhost HTTP and a local cookie name. Production needs HTTPS, protected production cookie settings, shared sessions, abuse controls, real CMP integration and the existing application's deployment process.
The sample debug sink is local test telemetry only; it is not CAPI or a network conversion API.
