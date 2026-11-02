# Event and dispatch contract
Prompt: `$gotooffer-tracking Add Go2Offer tracking without duplicates.`

| Event | Meaning |
|---|---|
| CTA_Click | Explicit initial intent; before verification |
| VerificationSuccess | Backend accepted a challenge, not just widget success |
| Go2Offer | Exactly the approved offer-action trigger |
| PrelanderB_View | Separately defined B page view, not a Go2Offer retry |
| Conversion | Advertiser-confirmed result with an agreed source/mapping |

Reference template definition: Go2Offer means an eligible explicit offer-navigation request, after the server-confirmed session. It includes a same-tab fallback request. It is not confirmation of destination delivery or viewing. Do not reuse this definition if the user's approved contract differs.

```js
const tracker = createTracker({
  eventName: config.eventName, trigger: 'offer_navigation_requested',
  transport: 'gtm', target: window,
  hasConsent: () => cmp.allows('analytics'),
  eligible: () => !config.windowsOnly || windowsDesktop(navigator),
});
const eventId = crypto.randomUUID(); // Once per logical attempt, not on every retry.
routerCallback = () => tracker.dispatch({
  at: 'offer_navigation_requested', eventId,
  parameters: { offer_name: config.offerName, offer_category: config.category, offer_type: config.type },
});
```
Replace illustrative cmp/config with real adapters. No production IDs or payload taxonomy are assumed.
GTM: push a custom event with event_id and payload. In Preview, create one matching Custom Event trigger and map data-layer variables. Enforce CMP/consent at the tag and SDK level; a dataLayer push does not prove a published tag fired.
Direct Meta: provide pixelId, set transport=meta, and initialize the authorized base Pixel once after required consent. The helper sends trackSingleCustom with eventID. Do not additionally fire through GTM.
If no existing loader owns initialization, [analytics-loader.mjs](../assets/analytics-loader.mjs) provides consent-gated loadMetaPixel and loadGtm functions with required IDs and duplicate-init guards. It sends no automatic PageView or Go2Offer. Use one owner, inspect an existing installation before calling init, and connect later consent revocation to the actual provider/CMP controls. Loading a container can execute its configured tags: inspect that container before enabling it.
CAPI pairing, when explicitly implemented: browser eventID and server event_id must describe the same action and use the same event name/data source. Do not regenerate the ID per transport. The template does not implement CAPI or guarantee Meta deduplication.
The ledger is at-most-once local dispatch per name/ID/runtime, not distributed exactly-once delivery. Unload, blockers, network failures and consent can lose delivery. For multiple workers/tabs use shared idempotency storage; never store a global boolean that suppresses all future genuine actions.
Debug: unit spies -> browser Network/dataLayer -> GTM Preview or Meta Test Events with separately authorized real sends. Compare stable ID, count and payload. Check B reload and direct B do not dispatch. Record remote receipt as NOT_RUN until observed.
Sources: [GTM data layer](https://developers.google.com/tag-platform/tag-manager/datalayer), [GTM consent](https://developers.google.com/tag-platform/security/guides/consent), [Meta deduplication](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events).
