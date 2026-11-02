// Browser preference/visitor cookies. Never use these as authentication proof.
const TOKEN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
export function readCookie(header, name) {
  if (!TOKEN.test(name)) throw new TypeError('Invalid cookie name');
  const item = String(header || '').split(';').map(x => x.trim()).find(x => x.startsWith(`${name}=`));
  if (!item) return null;
  try { return decodeURIComponent(item.slice(name.length + 1)); } catch { return null; }
}
export function serializeCookie(name, value, {
  maxAge = null, path = '/', domain, sameSite = 'Lax', secure = true, httpOnly = false,
} = {}) {
  if (!TOKEN.test(name) || typeof value !== 'string') throw new TypeError('Invalid cookie');
  if (maxAge !== null && (!Number.isSafeInteger(maxAge) || maxAge < 0)) throw new TypeError('maxAge must be nonnegative seconds');
  if (!['Lax', 'Strict', 'None'].includes(sameSite)) throw new TypeError('Invalid SameSite');
  if (!/^\/[\x21-\x3A\x3C-\x7E]*$/.test(path)) throw new TypeError('Invalid path');
  if (domain !== undefined && !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(domain)) throw new TypeError('Invalid domain');
  if (sameSite === 'None' && !secure) throw new TypeError('SameSite=None requires Secure');
  if (name.startsWith('__Host-') && (!secure || domain !== undefined || path !== '/')) throw new TypeError('__Host- requires Secure, Path=/, no Domain');
  if (name.startsWith('__Secure-') && !secure) throw new TypeError('__Secure- requires Secure');
  return [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`,
    ...(maxAge === null ? [] : [`Max-Age=${maxAge}`]), ...(domain ? [`Domain=${domain}`] : []),
    ...(secure ? ['Secure'] : []), ...(httpOnly ? ['HttpOnly'] : [])].join('; ');
}
export function browserCookies(doc = document, defaults = {}) {
  const get = name => { try { return readCookie(doc.cookie, name); } catch { return null; } };
  function set(name, value, options = {}) {
    const config = { ...defaults, ...options };
    if (config.httpOnly) throw new TypeError('HttpOnly can only be set by a server');
    try {
      doc.cookie = serializeCookie(name, value, config);
      return config.maxAge === 0 ? get(name) === null : get(name) === value;
    } catch (error) {
      if (error instanceof TypeError) throw error;
      return false; // Storage/privacy policy denied the write.
    }
  }
  function visitor({ name = 'affiliate_visitor', lifetimeSeconds = 31536000,
    refreshOnVisit = false, consent = false, id = () => crypto.randomUUID() } = {}) {
    if (!consent) return { status: 'not-consented', id: null, isReturning: false, persisted: false };
    const previous = get(name);
    const value = previous || id();
    const persisted = previous && !refreshOnVisit ? true : set(name, value, { maxAge: lifetimeSeconds });
    return { status: persisted ? 'available' : 'storage-unavailable', id: value, isReturning: Boolean(previous), persisted };
  }
  const expire = (name, options = {}) => set(name, '', { ...options, maxAge: 0 });
  return { get, set, update: set, remove: expire, expire, visitor };
}
