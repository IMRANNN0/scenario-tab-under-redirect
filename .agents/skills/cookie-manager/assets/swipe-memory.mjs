// Client state is an editable preference, not proof of verification.
export function createSwipeMemory({ cookies, name, lifetimeSeconds, hasConsent, allowWithoutConsent = false }) {
  if (!cookies || !name || typeof hasConsent !== 'function' ||
      typeof allowWithoutConsent !== 'boolean' ||
      !(lifetimeSeconds === null || (Number.isSafeInteger(lifetimeSeconds) && lifetimeSeconds > 0))) {
    throw new TypeError('Explicit cookie name, lifetime and consent function required');
  }
  return {
    remembered() { return (allowWithoutConsent || Boolean(hasConsent())) && cookies.get(name) === '1'; },
    remember() {
      if (!allowWithoutConsent && !hasConsent()) return { status: 'not-consented', persisted: false };
      const persisted = cookies.set(name, '1', { maxAge: lifetimeSeconds });
      return { status: persisted ? 'available' : 'storage-unavailable', persisted };
    },
    clear() { return cookies.remove(name); },
  };
}
