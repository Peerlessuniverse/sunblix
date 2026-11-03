import { NextResponse } from 'next/server';
import { getDbClient, isDbLive } from '../supabaseClient.js';
import { getClientIp, verifySurtiKey } from '../auth/surtiAuth.js';
import { verifyRequestAuth } from '../auth/staffAuth.js';

/**
 * SURTI GUARD
 * Shared helpers for the private SURTI API:
 *  - public-chat kill switch (SURTI_PUBLIC_ENABLED)
 *  - in-memory rate limiting
 *  - audit log (surti_audit_logs, best-effort)
 *  - Idempotency-Key replay cache
 *
 * Rate limit and idempotency state live in process memory, which is correct
 * for the single-process `next start` deployment on the VPS. Durable
 * deduplication (e.g. WhatsApp message ids) is done in the database by the
 * intake endpoint.
 */

/** Public SURTI chat/pages are OFF unless explicitly enabled. */
export function isSurtiPublicEnabled() {
  return String(process.env.SURTI_PUBLIC_ENABLED || '').toLowerCase() === 'true';
}

/** Map a service-layer Error to a JSON response (404 not found, 409 not allowed yet, else 400). */
export function errorResponse(error) {
  const message = error?.message || 'Permintaan gagal diproses.';
  let status = 400;
  if (/tidak ditemukan/i.test(message)) status = 404;
  else if (/belum bisa|belum sepakat/i.test(message)) status = 409;
  return NextResponse.json({ success: false, message }, { status });
}

export function notFoundResponse() {
  return NextResponse.json({ success: false, message: 'Not found.' }, { status: 404 });
}

// ---------------------------------------------------------------------------
// Rate limiting (fixed window)
// ---------------------------------------------------------------------------
const buckets = new Map();

/**
 * @param {string} bucketKey  e.g. "surti-key:crm" or "public:create_lead:1.2.3.4"
 * @param {number} limit      max requests per window
 * @param {number} windowMs   window length in ms
 * @returns {{ allowed: boolean, retryAfterSec: number }}
 */
export function checkRateLimit(bucketKey, limit, windowMs = 60_000) {
  const now = Date.now();
  let entry = buckets.get(bucketKey);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(bucketKey, entry);
  }
  entry.count += 1;

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (now >= v.resetAt) buckets.delete(k);
    }
  }

  return {
    allowed: entry.count <= limit,
    retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}

export function rateLimitResponse(retryAfterSec) {
  return NextResponse.json(
    { success: false, message: 'Terlalu banyak permintaan. Coba lagi sebentar lagi.' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
  );
}

/** Identify the caller for rate-limit bucketing. */
export function callerId(request, accessVia) {
  if (accessVia === 'surti-key') return 'surti-key';
  if (accessVia === 'staff') return 'staff';
  return `ip:${getClientIp(request) || 'local'}`;
}

// ---------------------------------------------------------------------------
// Private-caller authorization (staff session OR SURTI key) with rate limit
// ---------------------------------------------------------------------------

/**
 * Standard gate for the private SURTI endpoints.
 * @returns {{ ok: true, accessVia: 'staff'|'surti-key' } | { ok: false, response: NextResponse }}
 */
export function authorizePrivate(request, scope, { surtiLimit = 120, staffLimit = 300 } = {}) {
  const staff = verifyRequestAuth(request);
  const surti = verifySurtiKey(request);
  if (!staff.valid && !surti.valid) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Akses ditolak. Endpoint ini memerlukan sesi staf atau kunci layanan SURTI (header x-surti-key).' },
        { status: 401 }
      ),
    };
  }
  const accessVia = staff.valid ? 'staff' : 'surti-key';
  const rl = checkRateLimit(`${scope}:${callerId(request, accessVia)}`, accessVia === 'surti-key' ? surtiLimit : staffLimit);
  if (!rl.allowed) return { ok: false, response: rateLimitResponse(rl.retryAfterSec) };
  return { ok: true, accessVia };
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------
const auditMemory = new Map();

/**
 * Look up a previously written audit entry (used for durable de-duplication,
 * e.g. one WhatsApp message id must only create a lead once, even across
 * restarts). Checks the database when live, otherwise process memory.
 */
export async function findAuditEntry(entityType, entityId) {
  const key = `${entityType}:${entityId}`;
  if (auditMemory.has(key)) return auditMemory.get(key);
  try {
    if (isDbLive()) {
      const client = getDbClient();
      if (client) {
        const rows = await client
          .from('surti_audit_logs')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', String(entityId))
          .limit(1);
        if (Array.isArray(rows) && rows[0]) return rows[0].details || {};
      }
    }
  } catch (error) {
    console.error('[surtiGuard] audit lookup gagal:', error.message);
  }
  return null;
}


/**
 * Record an API action in surti_audit_logs. Never throws: auditing must not
 * break the request it describes.
 */
export async function writeAuditLog({ entityType, entityId, action, actor, details = {} }) {
  const line = `[AUDIT] ${actor} ${action} ${entityType}:${entityId || '-'}`;
  console.info(line);
  if (entityId) {
    auditMemory.set(`${entityType}:${entityId}`, details);
    if (auditMemory.size > 2000) auditMemory.delete(auditMemory.keys().next().value);
  }
  try {
    if (!isDbLive()) return;
    const client = getDbClient();
    if (!client) return;
    await client.insert('surti_audit_logs', {
      entity_type: entityType || 'api',
      entity_id: String(entityId || '-'),
      action,
      actor,
      details,
    });
  } catch (error) {
    console.error('[surtiGuard] audit log gagal:', error.message);
  }
}

// ---------------------------------------------------------------------------
// Idempotency
// ---------------------------------------------------------------------------
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const idempotencyCache = new Map();

/** Returns the Idempotency-Key header, trimmed and length-limited, or ''. */
export function getIdempotencyKey(request) {
  const raw = (request.headers.get('idempotency-key') || '').trim();
  return raw.length > 0 && raw.length <= 200 ? raw : '';
}

/** Previously stored { status, body } for this key, or null. */
export function getIdempotentResult(scope, key) {
  if (!key) return null;
  const entry = idempotencyCache.get(`${scope}:${key}`);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    idempotencyCache.delete(`${scope}:${key}`);
    return null;
  }
  return entry.value;
}

export function storeIdempotentResult(scope, key, value) {
  if (!key) return;
  idempotencyCache.set(`${scope}:${key}`, { value, expiresAt: Date.now() + IDEMPOTENCY_TTL_MS });
  if (idempotencyCache.size > 2000) {
    const now = Date.now();
    for (const [k, v] of idempotencyCache) {
      if (now > v.expiresAt) idempotencyCache.delete(k);
    }
  }
}

