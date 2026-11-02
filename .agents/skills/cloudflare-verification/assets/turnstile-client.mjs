let apiPromise;
export function loadTurnstile(doc = document) {
  if (globalThis.turnstile) return Promise.resolve(globalThis.turnstile);
  if (!apiPromise) apiPromise = new Promise((resolve, reject) => {
    const script = doc.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    const timer = setTimeout(() => { script.remove(); apiPromise = null; reject(new Error('Turnstile load timed out')); }, 12000);
    script.onload = () => { clearTimeout(timer); resolve(globalThis.turnstile); };
    script.onerror = () => { clearTimeout(timer); script.remove(); apiPromise = null; reject(new Error('Turnstile unavailable')); };
    doc.head.append(script);
  });
  return apiPromise;
}
export async function mountVerification(container, { sitekey, action, verifyUrl = '/api/verify',
  onState = () => {}, fetchImpl = fetch, api,
} = {}) {
  if (!sitekey || !action) throw new TypeError('Sitekey and action required');
  if (new URL(verifyUrl, location.href).origin !== location.origin) throw new TypeError('Verification endpoint must be same-origin');
  api ??= await loadTurnstile();
  let disposed = false;
  let busy = false;
  const state = (name, detail = {}) => { if (!disposed) onState({ state: name, ...detail }); };
  const id = api.render(container, {
    sitekey, action,
    callback: async token => {
      if (busy || disposed) return;
      busy = true; state('validating');
      try {
        const response = await fetchImpl(verifyUrl, {
          method: 'POST', credentials: 'same-origin', cache: 'no-store',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
          signal: AbortSignal.timeout(12000),
        });
        const result = await response.json();
        // A server Set-Cookie can be rejected. Confirm the session round trip too.
        if (!response.ok || result.verified !== true) throw new Error('Verification rejected');
        const check = await fetchImpl('/api/session', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(8000) });
        if (!check.ok || (await check.json()).verified !== true) throw new Error('Session unavailable');
        state('verified', { expiresAt: result.expiresAt });
      } catch { state('failure'); }
      finally { busy = false; if (!disposed) api.reset(id); }
    },
    'error-callback': () => state('failure'),
    'expired-callback': () => state('expired'),
    'timeout-callback': () => state('timeout'),
  });
  state('ready');
  return { retry: () => { state('retrying'); api.reset(id); }, destroy: () => { disposed = true; api.remove(id); } };
}
