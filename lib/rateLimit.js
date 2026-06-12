import { NextResponse } from 'next/server';

function getIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('true-client-ip') ||
    '0.0.0.0'
  );
}

function getStore() {
  if (!globalThis.__cheapggRateLimitStore) globalThis.__cheapggRateLimitStore = new Map();
  return globalThis.__cheapggRateLimitStore;
}

export function enforceRateLimit(req, { name, limit, windowMs, key } = {}) {
  const safeLimit = Number(limit) > 0 ? Number(limit) : 60;
  const safeWindow = Number(windowMs) > 0 ? Number(windowMs) : 60_000;
  const ip = getIp(req);
  const k = key || `${name || 'default'}:${ip}`;

  const store = getStore();
  const now = Date.now();
  const item = store.get(k);

  if (!item || now >= item.resetAt) {
    store.set(k, { count: 1, resetAt: now + safeWindow });
    return null;
  }

  item.count += 1;
  store.set(k, item);

  if (item.count <= safeLimit) return null;

  const retryAfterSeconds = Math.max(1, Math.ceil((item.resetAt - now) / 1000));
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
  );
}
