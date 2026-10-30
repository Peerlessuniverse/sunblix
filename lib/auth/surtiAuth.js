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

  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  return { valid, configured: true, reason: valid ? 'ok' : 'mismatch' };
}
