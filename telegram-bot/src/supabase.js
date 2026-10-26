/**
 * Supabase persistence (PostgREST, zero-dependency).
 * Skema mengikuti tabel surti_* web sunblix:
 *  - surti_customers (id UUID auto, name, email, phone, city, stage, notes) — upsert on email
 *  - surti_conversations (id UUID auto, session_id, customer_id, channel)
 *  - surti_messages (id UUID auto, conversation_id, role, content)
 * Gagal DB ≠ gagal chat: semua fungsi best-effort dengan logging.
 */

import { config } from './config.js';
import crypto from 'node:crypto';

const LIVE = Boolean(config.supabase.url && config.supabase.serviceKey);

function headers() {
  return {
    apikey: config.supabase.serviceKey,
    Authorization: `Bearer ${config.supabase.serviceKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
}

async function request(method, path, body) {
  if (!LIVE) return null;
  const resp = await fetch(`${config.supabase.url}/rest/v1${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  if (!resp.ok) {
    console.warn(`[supabase] ${method} ${path} → ${resp.status}`);
    return null;
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Upsert customer Telegram by synthetic email; return DB row (dengan id UUID).
 */
export async function upsertCustomer({ telegramId, name, username }) {
  const email = `tg-${telegramId}@telegram.sunblix.local`;

  // Cek dulu yang sudah ada (idempotent, tanpa conflict)
  const existing = await request('GET', `/surti_customers?email=eq.${encodeURIComponent(email)}&select=*`);
  if (existing && existing.length > 0) {
    // Perbarui nama/notes bila berubah (tanpa menurunkan stage)
    const cur = existing[0];
    if (name && cur.name !== name) {
      const upd = await request('PATCH', `/surti_customers?id=eq.${cur.id}`, {
        name,
        notes: username ? `Telegram: @${username}` : cur.notes,
      });
      return upd && upd.length > 0 ? upd[0] : cur;
    }
    return cur;
  }

  // Belum ada → insert baru
  const row = await request('POST', '/surti_customers', {
    id: crypto.randomUUID(),
    name: name || `Telegram ${telegramId}`,
    email,
    phone: '',
    customer_type: 'residential',
    stage: 'NEW_LEAD',
    notes: username ? `Telegram: @${username}` : 'Telegram user',
  });
  if (row && row.length > 0) return row[0];
  return { id: null, name: 'Customer' };
}

/** Catat pesan (role user/assistant) ke conversation hari ini. */
export async function logMessage({ customerId, role, content }) {
  try {
    if (!customerId) return;
    const today = new Date().toISOString().slice(0, 10);
    const sessionId = `telegram-${customerId}-${today}`;
    let conv = await request('GET', `/surti_conversations?session_id=eq.${encodeURIComponent(sessionId)}&select=*`);
    if (!conv || conv.length === 0) {
      conv = await request('POST', '/surti_conversations', {
        id: crypto.randomUUID(),
        session_id: sessionId,
        customer_id: customerId,
        channel: 'telegram',
      });
    }
    const convId = conv?.[0]?.id || conv?.id;
    if (!convId) return;
    await request('POST', '/surti_messages', {
      id: crypto.randomUUID(),
      conversation_id: convId,
      role,
      content,
    });
  } catch (err) {
    console.warn('[supabase] logMessage failed:', err.message);
  }
}

/** Update progres lead (nama/telepon/stage) — best-effort. */
export async function recordLeadProgress({ customerId, name, phone, stage, notes }) {
  try {
    if (!customerId) return;
    const patch = {};
    if (name) patch.name = name;
    if (phone) patch.phone = phone;
    if (stage) patch.stage = stage;
    if (notes) patch.notes = notes;
    if (Object.keys(patch).length === 0) return;
    await request('PATCH', `/surti_customers?id=eq.${customerId}`, patch);
  } catch (err) {
    console.warn('[supabase] recordLeadProgress failed:', err.message);
  }
}

export function isDbLive() {
  return LIVE;
}
