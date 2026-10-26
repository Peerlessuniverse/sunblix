/**
 * TypeSafe (Jev) — out-of-scope gate untuk SURTI.
 *
 * Desain mengikuti skill typesafe-ai: Jev memberi JUDGMENT (probabilitas
 * terkalibrasi), kode memegang DECISION (truth table + threshold).
 *
 * Truth table (keputusan di kode):
 * ┌──────────────────────────┬───────────────┬────────────────────┐
 * │ solar_related (Noul)     │ greeting_only │ Aksi               │
 * ├──────────────────────────┼───────────────┼────────────────────┤
 * │ >= 0.5                   │ apapun        │ LAYANI (ke LLM)    │
 * │ < 0.5                    │ >= 0.5        │ LAYANI (sapa balik)│
 * │ < 0.5                    │ < 0.5         │ DIAM (abaikan)     │
 * └──────────────────────────┴───────────────┴────────────────────┘
 * API error ≠ "no": error harus surface sebagai error (fallback ke keyword).
 */

import { config } from './config.js';

// Fallback keyword (dipakai kalau Jev error/unavailable)
const SCOPE_KEYWORDS = [
  'panel surya', 'plts', 'solar', 'surya', 'listrik', 'pln', 'tagihan',
  'inverter', 'baterai', 'atap', 'kwh', 'kwp', 'daya', 'va', 'watt',
  'on-grid', 'ongrid', 'hybrid', 'offgrid', 'off-grid', 'sph', 'penawaran',
  'survei', 'katalog', 'brosur', 'harga', 'paket', 'sunblix', 'surti',
  'mppt', 'meteran', 'prabayar', 'pascabayar', 'keluhan', 'garansi',
  'pasang', 'perawatan', 'hemat', 'konsultasi', 'survei', 'astronergy',
  'deye', 'solarman', 'spandek', 'genteng',
];

const GREETINGS = ['halo', 'hai', 'hi', 'hello', 'pagi', 'siang', 'sore',
  'malam', 'assalamualaikum', 'salam', 'permisi', 'test', 'tes', 'oke', 'ok', 'iya'];

export function keywordFallback(text) {
  const lower = (text || '').toLowerCase().trim();
  if (SCOPE_KEYWORDS.some((k) => lower.includes(k))) return 'in_scope';
  const words = lower.replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
  if (words.length <= 4 && words.every((w) => GREETINGS.includes(w))) return 'greeting';
  if (/^[0-9\s.,]+$/.test(lower)) return 'in_scope'; // jawaban angka (daya dsb.)
  return 'off_topic';
}

/**
 * Tanya Jev apakah pesan in-scope. Return { verdict, via } dengan
 * verdict ∈ 'in_scope' | 'greeting' | 'off_topic' | 'error'.
 */
export async function classifyMessage(text, fetchImpl = fetch) {
  const apiKey = config.typesafe.apiKey;
  if (!apiKey || !text || text.trim().length === 0) {
    // Tidak ada API key → langsung fallback keyword
    return { verdict: keywordFallback(text), via: 'keyword' };
  }

  // Pre-check cepat untuk pola pasti (angka murni = jawaban kualifikasi;
  // menyebut katalog/brosur/pdf = permintaan layanan) — sesuai skill:
  // "compare against a simple keyword rule first, sometimes code is enough".
  const lower = text.toLowerCase();
  if (/^[0-9\s.,]+$/.test(lower.trim()) || /katalog|brosur|pdf|catalog/.test(lower)) {
    return { verdict: 'in_scope', via: 'precheck' };
  }

  const body = JSON.stringify({
    model: config.typesafe.model,
    state: JSON.stringify({
      context: 'Percakapan dengan SURTI, konsultan panel surya PT SUNBLIX ENERGI INDONESIA, di Telegram. Pelanggan bisa mengirim jawaban singkat (angka daya, nama lokasi) atau meminta katalog/penawaran sebagai bagian alur konsultasi.',
      message: text,
    }),
    questions: {
      solar_related: {
        type: 'noul',
        instructions:
          'Is `message` related to this solar consultation in any way? Answer true when it mentions solar panels, electricity, power, bills, roofs, the company, or its bot services, or when it asks what the bot can do or how to use it, or when it is a short reply that fits the consultation flow (a number, a city name, a yes/no, or a request for catalog, quote, or survey). Answer false when it is about an unrelated topic such as a cooking recipe, sports, politics, or homework.',
      },
      greeting_only: {
        type: 'noul',
        instructions:
          'Is `message` only a greeting or small talk with no specific question or request? A greeting followed by a question about solar is not.',
      },
    },
  });

  try {
    const resp = await fetchImpl(`${config.typesafe.baseUrl}/v1/systemone`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body,
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) throw new Error(`TypeSafe API ${resp.status}`);
    const data = await resp.json();
    const solar = data?.answers?.solar_related?.noul ?? null;
    const greeting = data?.answers?.greeting_only?.noul ?? null;
    if (solar === null) throw new Error('TypeSafe: missing answer');

    // Truth table di kode
    if (solar >= config.typesafe.scopeThreshold) return { verdict: 'in_scope', via: 'jev' };
    if (greeting !== null && greeting >= 0.5) return { verdict: 'greeting', via: 'jev' };
    return { verdict: 'off_topic', via: 'jev' };
  } catch (err) {
    // Error = error, bukan "no". Fallback ke keyword — jangan pernah
    // menelan pesan pelanggan karena API down.
    console.warn('[typesafe] gate error, fallback ke keyword:', err.message);
    return { verdict: keywordFallback(text), via: 'keyword-fallback' };
  }
}
