# Cookie usage
Prompt: `$cookie-manager Add cookie support for returning visitors.`
Ask or infer from approved configuration: purpose, cookie name, seconds, fixed/rolling expiry, consent category and scope. Examples below are local design choices, not an approved production retention policy.

```js
import { browserCookies, serializeCookie } from './cookies.mjs';
const cookies = browserCookies(document, { path: '/', secure: true, sameSite: 'Lax' });
const visitor = cookies.visitor({
  name: 'my_visitor', lifetimeSeconds: 60 * 60 * 24 * 365,
  refreshOnVisit: false, consent: consentManager.allows('analytics'),
});
cookies.set('display_language', 'fr', { maxAge: 86400 });
cookies.get('display_language');
cookies.update('display_language', 'ar', { maxAge: 86400 });
cookies.remove('display_language'); // Pass original domain/path if not defaults.
// Backend response only:
const header = serializeCookie('__Host-session', opaqueSessionId, {
  maxAge: 1800, secure: true, httpOnly: true, path: '/', sameSite: 'Lax',
});
```
The last example needs a backend-owned session store. It does not create trusted state by itself.
A one-year visitor cookie is separate from the shorter security-session TTL.
A q=yes cookie can be an editable UI hint, never a verification decision.
A remembered swipe is another editable hint. Use [swipe-memory.mjs](../assets/swipe-memory.mjs) only with an actual consent decision, a configured name and a specified lifetime (or an explicitly requested session cookie). Save after the gesture completes; determine separately whether later visits should skip it. Clear on withdrawal. Do not add tracking or navigation merely because a cookie exists.

When the user requests this feature and no consent integration exists, a clearly worded, initially unchecked optional choice can request consent for the specified duration. The completion cookie may also record that the visitor chose to remember the completed gesture; write it only when the choice is checked and the gesture succeeds. A previously saved value represents that earlier choice, not trusted identity or human verification. Offer a way to forget it on a later visit, and do not skip an explicit offer CTA or modify tracking.

If the user explicitly directs storage without adding a consent choice, the helper has a scoped `allowWithoutConsent` option. Leave `hasConsent` false in that mode, document that visitor consent was not collected, and do not apply the exception to unrelated projects. Never claim that the cookie establishes verification.
A cookie identifies browser storage, not a person or all their devices.
Without consent, recognition returns not-consented. With denied storage it returns storage-unavailable; it never claims persistence.
Scope: omitted Domain is host-only; Domain can include matching subdomains, not an unrelated domain or public suffix. Path controls sending, not security isolation. Secure limits transport to HTTPS; it does not encrypt the stored value. SameSite controls cross-site sending. HttpOnly prevents script access and must be set by the server. Deletion must match name, domain and path.
Browser policies can shorten retention; clearing cookies/private sessions break recognition.
Tests: `node --test assets/tests/cookies.test.mjs`. See sibling funnel-qa for actual browser expiry/rejection cases.
Sources: [MDN cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies), [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).
