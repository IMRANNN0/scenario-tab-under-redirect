# Interaction integration
Prompt: `$swipe-interaction Create a swipe-to-continue popup.`
Choose [unified CTA](unified-cta.md) when a single integrated action is requested; otherwise the three range/button assets are an accessible starting point. Adapt visible labels/tokens to the actual page and give instances unique label/title IDs.

```js
const swipe = mountSwipe(document.querySelector('[data-swipe]'), {
  onSuccess: ({event, source}) => handleExplicitContinue(event, source),
  onCancel: () => dialog.close(),
});
opener.addEventListener('click', () => { swipe.reset(); dialog.showModal(); });
dialog.addEventListener('close', () => { swipe.reset(); opener.focus(); });
// Unmount:
swipe.destroy();
```
Native dialog supplies modal containment/Escape for supported browsers. Test focus restoration and your framework's unmount behavior. Include a visible close control unless the user chooses its removal; in that mode provide and test Escape plus backdrop/touch dismissal. The button alternative may be the swipe control itself, but its tap/keyboard operation must be understandable and accessible.
Callbacks are synchronous. Do asynchronous server checks before displaying the ready interaction, not between the gesture and window.open.
The user can automate the slider or button. Neither callback nor isTrusted is a security authorization; isTrusted is used here only to avoid accidental synthetic navigation.
Styling direction: a utility control, inherited typography, stable accent, 48px target sizes, visible focus and no idle animations. Direction is intentionally neutral because production branding belongs to the approved prelander.
Tests: use sibling funnel-qa's pointer, keyboard, touch, incomplete, cancel and modal cases. The supplied runner covers Chromium; other engines must be separately run.
Source: [WAI dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
