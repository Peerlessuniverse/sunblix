import crypto from 'crypto';

/**
 * SURTI SERVICE AUTHENTICATION
 * Dedicated, revocable API key for the SURTI assistant (Hermes instance / bot)
 * to read and write Sunblix CRM data without staff credentials.
 *
 * Key comes strictly from the environment (SURTI_CRM_API_KEY) and is never
 * exposed to client bundles. Comparison is constant-time.
 *
 * Accepted transports:
 *   x-surti-key: <key>
 *   Authorization: Bearer <key>
 */

const HEADER_NAME = 'x-surti-key';
const MIN_KEY_LENGTH = 24;

/**
 * Read the configured SURTI key. Returns null when unset or too short, so
 * callers can distinguish "not configured" from "wrong key".
 */
export function getSurtiCrmKey() {
  const raw = process.env.SURTI_CRM_API_KEY;
  if (!raw || raw.trim().length < MIN_KEY_LENGTH) {
    return null;
  }
  return raw.trim();
}

/**
 * Extract the presented key from either supported header.
 */
function extractPresentedKey(request) {
  const direct = request.headers.get(HEADER_NAME);
  if (direct && direct.trim()) {
    return direct.trim();
  }
  const auth = request.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return '';
}

/**
 * Optional previous key, accepted during key rotation only.
 * Set SURTI_CRM_API_KEY_PREVIOUS while rolling a new SURTI_CRM_API_KEY out to
 * the SURTI instance, then remove it.
 */
function getPreviousSurtiKey() {
  const raw = process.env.SURTI_CRM_API_KEY_PREVIOUS;
  if (!raw || raw.trim().length < MIN_KEY_LENGTH) {
    return null;
  }
  return raw.trim();
}

function safeEqual(presented, expected) {
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Client IP as set by the reverse proxy (nginx: `proxy_set_header X-Real-IP
 * $remote_addr;`). Returns '' for direct local connections that bypass nginx.
 */
export function getClientIp(request) {
  return (request.headers.get('x-real-ip') || '').trim();
}

/**
 * Optional IP allowlist (SURTI_ALLOWED_IPS, comma separated). When unset every
 * IP is allowed. A request without X-Real-IP did not come through nginx (it is
 * a direct local connection from the VPS / Docker network), so it is allowed
 * as long as the application port is not exposed publicly.
 */
function isIpAllowed(request) {
  const raw = process.env.SURTI_ALLOWED_IPS;
  if (!raw || !raw.trim()) {
    return true;
  }
  const ip = getClientIp(request);
  if (!ip) {
    return true;
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(ip);
}

/**
 * Verify a request against the SURTI service key.
 * Returns { valid, configured, reason }.
 */
export function verifySurtiKey(request) {
  const expected = getSurtiCrmKey();
  if (!expected) {
    return { valid: false, configured: false, reason: 'not_configured' };
  }

  const presented = extractPresentedKey(request);
  if (!presented) {
    return { valid: false, configured: true, reason: 'missing' };
  }

  const previous = getPreviousSurtiKey();
  const keyOk = safeEqual(presented, expected) || (previous ? safeEqual(presented, previous) : false);
  if (!keyOk) {
    return { valid: false, configured: true, reason: 'mismatch' };
  }

  if (!isIpAllowed(request)) {
    return { valid: false, configured: true, reason: 'ip_not_allowed' };
  }

  return { valid: true, configured: true, reason: 'ok' };
}
