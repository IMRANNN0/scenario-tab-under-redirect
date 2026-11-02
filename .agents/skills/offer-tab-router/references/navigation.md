# Navigation contract
Prompt: `$offer-tab-router Open the offer in a new tab and optionally show Prelander B in the original tab.`

```js
const router = createOfferRouter({
  offerUrl: config.approvedOfferUrl, bUrl: config.optionalSameOriginB,
  mode: 'new-tab',
  onRequested: ({eventId}) => tracker?.dispatch({at:'offer_navigation_requested',eventId}),
  onResult: result => renderOutcome(result),
});
link.href = config.approvedOfferUrl; // Ordinary navigation fallback.
link.addEventListener('click', event => {
  router.route(event, {eventId: currentLogicalActionId});
});
```
With a verification gate, finish server validation before enabling a fresh explicit link/button. Do not call window.open in an async fetch/Turnstile completion callback, reserve hidden blank tabs while verifying, or repeatedly retry blocked openings.
The router opens about:blank within the user's activation, immediately nulls opener and requests the approved offer. It uses the returned handle to detect a blocked opening; no focus manipulation. A non-null handle is not network/destination success.
Outcomes: not-handled (modifiers/synthetic/default-prevented), duplicate, new-tab-requested, same-tab-requested, navigation-failed, b-navigation-failed. Deduplication is per logical action ID; a later genuine action may open another offer. onRequested means an attempt; onResult reports local behavior. For navigation-failed, keep an ordinary offer link/retry. For b-navigation-failed the offer was already requested; do not retry that offer action just to retry B.
Without B, the original remains. With blocked opening or same-tab mode, only the offer is requested. B page loads/reloads carry no offer event by default. For an expressly requested A-originated B-load proxy, pass one fresh handoff marker and let the tracking component qualify and consume it on B; this does not establish an offer view.
Use an anchor to preserve Ctrl/Cmd/middle click and JavaScript-disabled navigation where compatible with the requested gate. A server enforcement boundary belongs to a protected backend; a public affiliate URL cannot be made secret by hiding a UI control.
Do not invent click_id parameter mappings or strip existing tracking queries. Do not claim ad-platform acceptance. Check applicable campaign restrictions before enabling tab-under behavior.
Source: [MDN window.open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open).
