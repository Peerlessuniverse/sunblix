/**
 * SURTI Telegram Bot — Konfigurasi
 * Semua nilai dibaca dari environment variables ( Coolify / .env ).
 * Tidak ada rahasia yang hard-coded.
 */

export const config = {
  telegram: {
    // Token dari @BotFather
    token: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  nous: {
    // Nous Portal inference (OpenAI-compatible)
    baseUrl: process.env.NOUS_BASE_URL || 'https://inference-api.nousresearch.com/v1',
    apiKey: process.env.NOUS_API_KEY || '',
    model: process.env.NOUS_MODEL || 'minimax/minimax-m3.1-flash',
  },
  typesafe: {
    // TypeSafe / Jev — out-of-scope gate (optional, ada fallback keyword)
    apiKey: process.env.TYPESAFE_API_KEY || '',
    baseUrl: 'https://api.typesafe.ai',
    model: 'jev-latest',
    // Threshold: prob >= ini dianggap in-scope (layani)
    scopeThreshold: 0.5,
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  catalog: {
    pdfUrl: 'https://jasasolarpanelindonesia.sunblix.id/SUNBLIX_KATALOG_2026.pdf',
  },
  limits: {
    // Percakapan per user yang dikirim ke LLM (window)
    historyWindow: 12,
    // Timeout LLM (ms)
    llmTimeoutMs: 90000,
  },
};
