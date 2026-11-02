# One visual swipe action

Use this mode for requests to combine the slider, its label and Continue into one action. The reusable [button markup](../assets/swipe-unified.html), [style](../assets/swipe-unified.css) and [behavior](../assets/swipe-unified.mjs) deliberately preserve native tap, Enter and Space activation. Drag progress is visual; the native button remains the semantic action.

```js
const swipe = mountUnifiedSwipe(dialog.querySelector('[data-unified-swipe]'), {
  onSuccess: ({event, source}) => continueFromUserActivation(event, source),
});
// Opening: swipe.reset(); dialog.showModal(); button.focus();
// Closing: swipe.reset(); restore focus to the actual opener.
```

A completed drag activates only on release at the threshold; an incomplete, vertical or canceled drag resets without navigating. Tap anywhere on the same control is the equivalent button action, disclosed by a short `or tap` label. Do not set `aria-pressed` or an ARIA slider role on this button. Do not turn the control into a verification or security badge.

For a gaming dialog, inherit the game's palette and typography and reuse authentic media as the backdrop. Keep the action readable over footage, use the original poster when reduced motion/save-data is active, pause media when closed/hidden, and avoid playing both the hero and popup loops concurrently. No generated replacement is needed when originals exist.

Visible Cancel and × are presentation choices, not required by the component. If the user removes them, preserve Escape, backdrop pointer/touch dismissal, focus containment and restoration. Avoid accidental backdrop dismissal during a drag: check that pointer down and up both happened outside the panel.

Test keyboard Enter and Space, tap, full/partial/vertical/touch drags, pointercancel/lost capture, reset/reopen, duplicate click after a drag, narrow layouts, poster fallback and dismissal. Use a local destination fixture rather than relying only on interception after a server redirect.
