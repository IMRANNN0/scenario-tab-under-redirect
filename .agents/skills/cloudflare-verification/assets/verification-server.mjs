import { randomBytes, randomUUID, createHash } from 'node:crypto';
const COOKIE_NAME = /^[A-Za-z0-9_-]+$/;
const digest = value => createHash('sha256').update(value).digest('hex');
// Local example only. Production requires a shared, durable TTL store and rate limiting.
export function memorySessionStore({ now = Date.now, maxSessions = 1000 } = {}) {
  const entries = new Map();
  return {
    async get(key) {
      const row = entries.get(key);
      if (!row || row.expiresAt <= now()) { entries.delete(key); return null; }
      return { ...row };
    },
    async set(key, row) {
      for (const [id, item] of entries) if (item.expiresAt <= now()) entries.delete(id);
      if (entries.size >= maxSessions) throw new Error('Session capacity reached');
      entries.set(key, { ...row });
    },
    async delete(key) { entries.delete(key); },
  };
}
export function createVerificationService({ secret, hostnames, action, allowedOrigins, store,
  cookieName = '__Host-aff_verified', sessionTtlSeconds = 1800, secure = true,
  now = Date.now, fetchImpl = fetch, timeoutMs = 8000, attempts = 2,
} = {}) {
  if (!secret || !hostnames?.length || !allowedOrigins?.length || !store || !/^[A-Za-z0-9_-]{1,32}$/.test(action || '')) throw new TypeError('Verification configuration required');
  if (!COOKIE_NAME.test(cookieName) || ((cookieName.startsWith('__Host-') || cookieName.startsWith('__Secure-')) && !secure)) throw new TypeError('Invalid session cookie');
  if (!Number.isSafeInteger(sessionTtlSeconds) || sessionTtlSeconds < 1 || sessionTtlSeconds > 86400) throw new TypeError('Explicit session TTL required (1..86400 seconds)');
  if (![1, 2].includes(attempts) || timeoutMs < 1 || timeoutMs > 30000) throw new TypeError('Bounded Siteverify calls required');
  function sessionId(header = '') {
    const values = header.split(';').map(x => x.trim()).filter(x => x.startsWith(`${cookieName}=`));
    if (values.length !== 1) return null;
    const id = values[0].slice(cookieName.length + 1);
    return /^[a-f0-9]{64}$/.test(id) ? id : null;
  }
  const cookie = (id, seconds) => `${cookieName}=${id}; Path=/; Max-Age=${seconds}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`;
  async function status(header) {
    const id = sessionId(header);
    if (!id) return { verified: false };
    try {
      const row = await store.get(digest(id));
      return row?.action === action && row.expiresAt > now() ? { verified: true, expiresAt: row.expiresAt } : { verified: false };
    } catch { return { verified: false }; }
  }
  async function revoke(header) {
    const id = sessionId(header);
    if (id) await store.delete(digest(id));
    return cookie('', 0);
  }
  async function verify({ token, cookieHeader = '', origin }) {
    if (!allowedOrigins.includes(origin)) return { verified: false, reason: 'origin' };
    if (typeof token !== 'string' || !token.trim() || token.length > 2048) return { verified: false, reason: 'token' };
    const idempotencyKey = randomUUID();
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const response = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          signal: AbortSignal.timeout(timeoutMs),
          body: new URLSearchParams({ secret, response: token, idempotency_key: idempotencyKey }),
        });
        if (!response.ok) {
          if (response.status >= 500 && attempt + 1 < attempts) continue;
          return { verified: false, reason: 'upstream' };
        }
        const data = await response.json();
        if (data.success !== true || data.action !== action || !hostnames.includes(data.hostname)) return { verified: false, reason: 'challenge' };
        const id = randomBytes(32).toString('hex');
        const expiresAt = now() + sessionTtlSeconds * 1000;
        await store.set(digest(id), { action, expiresAt });
        const oldId = sessionId(cookieHeader);
        if (oldId) await store.delete(digest(oldId)); // Rotate any prior identifier.
        return { verified: true, expiresAt, setCookie: cookie(id, sessionTtlSeconds) };
      } catch {
        if (attempt + 1 === attempts) return { verified: false, reason: 'unavailable' };
      }
    }
    return { verified: false, reason: 'unavailable' };
  }
  return { verify, status, revoke };
}
