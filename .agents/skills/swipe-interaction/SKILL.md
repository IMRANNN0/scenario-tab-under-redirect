---
name: swipe-interaction
description: Build an accessible responsive swipe-to-continue component on a page or in a modal, with a button alternative and success/cancel callbacks. Use for interaction UI, never as human verification or bot filtering proof.
---

# Swipe Interaction

Own the interaction component; do not add verification, tracking or navigation unasked.
- Inspect approved UI, assets and page rules. State what completing the swipe does. Disclose offer/new-tab behavior in its label where applicable.
- Adapt [assets/swipe.html](assets/swipe.html), [assets/swipe.css](assets/swipe.css) and [assets/swipe.mjs](assets/swipe.mjs). Keep a labelled native range and a clear equivalent button. Callbacks carry the original event and interaction source, not security proof.
- Support touch, pointer, keyboard, visible focus, readable status, partial-swipe reset, cancel and repeat prevention. Avoid decorative movement and honor reduced motion.
- Use the target's accessible dialog primitive for a modal: initial focus, containment, Escape/close and restoration to the opener. A separate page uses the component without a focus trap. See [references/usage.md](references/usage.md).
- Keep callbacks synchronous when they initiate a new tab. Finish asynchronous verification first, then request a fresh explicit action. Never auto-complete after verification or page load.
- Do not impersonate Cloudflare or label a swipe CAPTCHA/human proof. Real verification belongs to cloudflare-verification.
- Run funnel-qa's browser cases for partial/completed swipe, button, keyboard, cancel, mobile layout and modal focus. Report the browsers actually tested.
