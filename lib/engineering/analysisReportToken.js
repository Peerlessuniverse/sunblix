import crypto from 'node:crypto';

const DEFAULT_TTL_SECONDS = 30 * 24 * 60 * 60;
const MAX_TOKEN_LENGTH = 16_384;

function encryptionKey() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SECRET must be configured to protect public analysis reports.');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

export function createAnalysisReportToken(data, { now = Date.now(), ttlSeconds = DEFAULT_TTL_SECONDS } = {}) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new TypeError('Report data must be an object.');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const payload = Buffer.from(JSON.stringify({ data, exp: now + ttlSeconds * 1000 }), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(payload), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString('base64url')).join('.');
}

export function readAnalysisReportToken(token, { now = Date.now() } = {}) {
  if (typeof token !== 'string' || token.length > MAX_TOKEN_LENGTH) return null;
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) return null;
  try {
    const [iv, tag, ciphertext] = parts.map((part) => Buffer.from(part, 'base64url'));
    if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) return null;
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), iv);
    decipher.setAuthTag(tag);
    const payload = JSON.parse(Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8'));
    if (!payload || typeof payload.exp !== 'number' || now >= payload.exp || !payload.data || typeof payload.data !== 'object') return null;
    return payload.data;
  } catch {
    return null;
  }
}
