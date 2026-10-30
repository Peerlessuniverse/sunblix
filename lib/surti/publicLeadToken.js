import crypto from 'node:crypto';
import { recordLead, getLeadById } from './crmService.js';

const secret = process.env.SURTI_PUBLIC_TOKEN_SECRET || 'sunblix-dev-public-token-secret';

function sign(value) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

export function createLeadToken(leadId) {
  const value = Buffer.from(JSON.stringify({ leadId, exp: Date.now() + 7 * 86400000 })).toString('base64url');
  return `${value}.${sign(value)}`;
}

export function verifyLeadToken(token) {
  try {
    const [value, signature] = String(token || '').split('.');
    if (!value || !signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(value)))) return null;
    const payload = JSON.parse(Buffer.from(value, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch { return null; }
}

export async function getLeadByPublicToken(token) {
  const payload = verifyLeadToken(token);
  if (!payload?.leadId) return null;
  const lead = getLeadById(payload.leadId);
  if (lead) return lead;
  return null;
}

export { recordLead };

export function publicLeadUrl(request, token) {
  return new URL(`/kalkulator?lead=${encodeURIComponent(token)}`, request.url).toString();
}

export function makePublicLead(payload) {
  const lead = recordLead(payload);
  return { lead, token: createLeadToken(lead.id) };
}
  
