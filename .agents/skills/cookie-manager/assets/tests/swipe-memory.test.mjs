import test from 'node:test';
import assert from 'node:assert/strict';
import { browserCookies } from '../cookies.mjs';
import { createSwipeMemory } from '../swipe-memory.mjs';

function jar(disabled = false) {
  const values = new Map();
  return {
    get cookie() { return [...values].map(([k, v]) => `${k}=${v}`).join('; '); },
    set cookie(value) {
      if (disabled) return;
      const pair = value.split(';')[0], i = pair.indexOf('=');
      if (value.includes('Max-Age=0')) values.delete(pair.slice(0, i));
      else values.set(pair.slice(0, i), pair.slice(i + 1));
    },
  };
}
test('stores only with consent, persists across instances, and clears on withdrawal', () => {
  const doc = jar(), cookies = browserCookies(doc); let consent = false;
  const options = { cookies, name: 'test_swipe', lifetimeSeconds: 60, hasConsent: () => consent };
  const first = createSwipeMemory(options);
  assert.equal(first.remember().status, 'not-consented'); assert.equal(doc.cookie, '');
  consent = true; assert.equal(first.remembered(), false); assert.equal(first.remember().persisted, true);
  assert.equal(createSwipeMemory(options).remembered(), true);
  consent = false; assert.equal(first.remembered(), false); assert.equal(first.clear(), true); assert.equal(doc.cookie, '');
});
test('blocked storage and missing retention fail safely', () => {
  const cookies = browserCookies(jar(true));
  const memory = createSwipeMemory({ cookies, name: 'test_swipe', lifetimeSeconds: null, hasConsent: () => true });
  assert.equal(memory.remember().status, 'storage-unavailable'); assert.equal(memory.remembered(), false);
  assert.throws(() => createSwipeMemory({ cookies, name: 'test_swipe', hasConsent: () => true }));
});
test('explicit no-consent mode is scoped and never implies consent', () => {
  const doc = jar(), cookies = browserCookies(doc);
  const memory = createSwipeMemory({ cookies, name: 'test_swipe', lifetimeSeconds: 31536000, hasConsent: () => false, allowWithoutConsent: true });
  assert.equal(memory.remember().persisted, true); assert.equal(memory.remembered(), true);
  const ordinary = createSwipeMemory({ cookies, name: 'test_swipe', lifetimeSeconds: 31536000, hasConsent: () => false });
  assert.equal(ordinary.remembered(), false);
});
