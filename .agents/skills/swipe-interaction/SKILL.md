---
name: swipe-interaction
description: Build accessible swipe-to-continue UI with an integrated gesture/tap/keyboard CTA or a range and button, on a page or in a modal. Use for interaction, never as human verification or bot filtering proof.
---

# Swipe Interaction

Own the interaction component; do not add verification, tracking or navigation unasked.
- Inspect approved UI, assets and page rules. State what completing the swipe does. Disclose offer/new-tab behavior in its label where applicable.
- Choose the presentation from the approved design: [unified CTA](references/unified-cta.md) puts drag, tap and native button keyboard activation in one control; [range and button](assets/swipe.html) retains a separate labelled range and equivalent button. Do not force a separate Continue button when the user asks for one combined action. Callbacks carry the original event and interaction source, not security proof.
- Support touch, pointer, keyboard, visible focus, readable status, partial-swipe reset, cancel and repeat prevention. Avoid decorative movement and honor reduced motion.
- Use the target's accessible dialog primitive for a modal: initial focus, containment, dismissal and restoration to the opener. Respect requested removal of visible Cancel/× controls; keep Escape and a tested pointer/touch exit such as the backdrop. A separate page uses the component without a focus trap. See [references/usage.md](references/usage.md).
- Treat utility assets as behavior examples, not a finished gaming art direction. Read repository preferences. For a media-backed gaming dialog, use original game assets, readable local contrast, stable accents and a poster/reduced-motion fallback. Preserve a rejected version as rejected before revising it.
- Keep callbacks synchronous when they initiate a new tab. Finish asynchronous verification first, then request a fresh explicit action. Never auto-complete after verification or page load.
- Do not impersonate Cloudflare or label a swipe CAPTCHA/human proof. Real verification belongs to cloudflare-verification.
- Run funnel-qa's cases for partial/completed pointer and touch drag, tap/keyboard alternative, pointer cancellation, dismissal, focus, repeat prevention and narrow screens. Test off-component click destinations with local fixtures; browser route interception may not intercept an HTTP redirect's external destination. Report the browsers actually tested.
