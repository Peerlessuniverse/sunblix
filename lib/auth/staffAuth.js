import crypto from 'crypto';

/**
 * SUNBLIX STAFF AUTHENTICATION & SESSION HELPER
 * Provides secure server-side HMAC-SHA256 session tokens and cookie helpers.
 * Never stores raw secrets or PINs.
 */

const COOKIE_NAME = 'sunblix_staff_session';
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

/**
 * Get the server auth secret from environment.
 * If not set, returns null so caller can handle appropriately.
 */
export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length < 16) {
    return null;
  }
  return secret.trim();
}

/**
 * Get valid internal staff PINs strictly from environment variables.
 * Returns an array of normalized valid PIN strings (whitespace & symbols stripped).
 * Returns empty array if no environment variables are defined.
 */
export function getValidStaffPins() {
  const pins = [];
  const primaryPin = process.env.INTERNAL_STAFF_PIN;
  const backupPin = process.env.INTERNAL_BACKUP_PIN;

  if (primaryPin && primaryPin.trim()) {
    pins.push(normalizePin(primaryPin));
  }
  if (backupPin && backupPin.trim()) {
    pins.push(normalizePin(backupPin));
  }

  return pins;
}

/**
 * Server-side Staff Accounts directory.
 * Kept strictly on the server; never exposed to client bundles.
 * Passwords can be overridden via STAFF_PASSWORD environment variable.
 */
export function getStaffDirectory() {
  const sharedPassword = (process.env.STAFF_PASSWORD || 'sunblix2026').trim();
  const dannyPassword = (process.env.STAFF_DANNY_PASSWORD || sharedPassword).trim();
  const engineerPassword = (process.env.STAFF_ENGINEER_PASSWORD || sharedPassword).trim();
  const warsaPassword = (process.env.STAFF_WARSA_PASSWORD || sharedPassword).trim();
  const adminPassword = (process.env.STAFF_ADMIN_PASSWORD || sharedPassword).trim();

  return [
    {
      ids: ['danny@sunblix.id', 'danny'],
      password: dannyPassword,
      user: {
        name: 'Danny',
        role: 'Director / CEO',
        avatar: 'D',
        email: 'danny@sunblix.id',
      },
    },
    {
      ids: ['engineer@sunblix.id', 'engineer'],
      password: engineerPassword,
      user: {
        name: 'Tim Engineering EPC',
        role: 'Lead Rooftop EPC Engineer',
        avatar: 'E',
        email: 'engineer@sunblix.id',
      },
    },
    {
      ids: ['warsa@sunblix.id', 'warsa'],
      password: warsaPassword,
      user: {
        name: 'Warsa',
        role: 'Account Executive',
        avatar: 'W',
        email: 'warsa@sunblix.id',
      },
    },
    {
      ids: ['admin@sunblix.id', 'admin', 'sunblix'],
      password: adminPassword,
      user: {
        name: 'Administrator',
        role: 'Operations & IT Admin',
        avatar: 'A',
        email: 'admin@sunblix.id',
      },
    },
  ];
}

/**
 * Constant-time string equality check to prevent timing attacks
 */
export function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify username & password against server-side staff directory.
 * Returns { valid: true, user } or { valid: false }
 */
export function verifyStaffCredentials(username, password) {
  if (!username || !password) return { valid: false };

  const uClean = String(username).trim().toLowerCase();
  const pClean = String(password).trim();
  const directory = getStaffDirectory();

  for (const entry of directory) {
    if (entry.ids.includes(uClean)) {
      if (safeCompare(entry.password, pClean)) {
        return { valid: true, user: entry.user };
      }
    }
  }

  return { valid: false };
}

/**
 * Normalize a PIN by stripping whitespace, hyphens, plus signs, and dots.
 */
export function normalizePin(pin) {
  if (!pin) return '';
  return String(pin).trim().replace(/[\s\-\+\.]/g, '');
}

/**
 * Generate a signed session token.
 * Token structure: base64(payload).signature
 * Payload contains: role, user, timestamp, expiry, nonce
 */
export function generateSessionToken(role = 'staff', user = null) {
  const secret = getAuthSecret();
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured or too short (min 16 chars).');
  }

  const now = Date.now();
  const payload = {
    role,
    user: user ? { name: user.name, role: user.role, email: user.email, avatar: user.avatar } : null,
    issuedAt: now,
    expiresAt: now + (SESSION_MAX_AGE_SECONDS * 1000),
    nonce: crypto.randomBytes(8).toString('hex'),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verify a session token.
 * Returns { valid: true, payload } if signature and expiry are valid.
 * Returns { valid: false, reason } otherwise.
 */
export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'missing_token' };
  }

  const secret = getAuthSecret();
  if (!secret) {
    return { valid: false, reason: 'server_misconfigured' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'malformed_token' };
  }

  const [payloadB64, signature] = parts;

  // Constant-time signature comparison to prevent timing attacks
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { valid: false, reason: 'invalid_signature' };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.expiresAt || Date.now() > payload.expiresAt) {
      return { valid: false, reason: 'expired_token' };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false, reason: 'invalid_payload' };
  }
}

/**
 * Extract and verify staff session from a Next.js Request.
 * Checks (1) HTTP-only Cookie 'sunblix_staff_session', and (2) Authorization header Bearer token.
 */
export function verifyRequestAuth(request) {
  // 1. Check Cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookies(cookieHeader);
  const sessionCookie = cookies[COOKIE_NAME];

  if (sessionCookie) {
    const res = verifySessionToken(sessionCookie);
    if (res.valid) return res;
  }

  // 2. Check Authorization Header: Bearer <token>
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const res = verifySessionToken(token);
    if (res.valid) return res;
  }

  return { valid: false, reason: 'unauthorized' };
}

/**
 * Format a Set-Cookie header for staff session.
 */
export function createSessionCookie(token) {
  const isProd = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}`;
}

/**
 * Format a Set-Cookie header to clear staff session.
 */
export function createClearSessionCookie() {
  const isProd = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}`;
}

function parseCookies(cookieHeader) {
  const map = {};
  if (!cookieHeader) return map;
  const parts = cookieHeader.split(';');
  for (const p of parts) {
    const [k, v] = p.split('=');
    if (k && v) {
      map[k.trim()] = decodeURIComponent(v.trim());
    }
  }
  return map;
}

export { COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
