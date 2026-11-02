# Interaction integration
Prompt: `$swipe-interaction Create a swipe-to-continue popup.`
Copy the three assets and adapt visible labels/tokens to the approved page. A range plus button is a framework-neutral accessible starting point. Give every instance unique label/title IDs.

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
Native dialog supplies modal containment/Escape for supported browsers. Test focus restoration and your framework's unmount behavior. Add an explicit close button. Do not hide the button alternative behind a swipe-only gesture.
Callbacks are synchronous. Do asynchronous server checks before displaying the ready interaction, not between the gesture and window.open.
The user can automate the slider or button. Neither callback nor isTrusted is a security authorization; isTrusted is used here only to avoid accidental synthetic navigation.
Styling direction: a utility control, inherited typography, stable accent, 48px target sizes, visible focus and no idle animations. Direction is intentionally neutral because production branding belongs to the approved prelander.
Tests: use sibling funnel-qa's pointer, keyboard, touch, incomplete, cancel and modal cases. The supplied runner covers Chromium; other engines must be separately run.
Source: [WAI dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
