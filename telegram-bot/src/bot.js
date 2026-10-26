/**
 * SURTI Telegram Bot — entry point.
 * grammY long-polling (tanpa webhook → tidak butuh domain/publik).
 *
 * Alur per pesan:
 *  1. TypeSafe gate (Jev): in_scope / greeting / off_topic
 *  2. off_topic → SURTI diam (tidak membalas apa pun)
 *  3. in_scope / greeting → askSurti (Nous Portal) → balas (typewriter-ish)
 *  4. Semua pesan in_scope dicatat ke Supabase
 */

import { Bot } from 'grammy';
import { config } from './config.js';
import { classifyMessage } from './typesafeGate.js';
import { askSurti } from './surtiBrain.js';
import { upsertCustomer, logMessage, isDbLive } from './supabase.js';

if (!config.telegram.token) {
  console.error('[SURTI] TELEGRAM_BOT_TOKEN belum diset. Keluar.');
  process.exit(1);
}
if (!config.nous.apiKey) {
  console.error('[SURTI] NOUS_API_KEY belum diset. Keluar.');
  process.exit(1);
}

const bot = new Bot(config.telegram.token);

/** Riwayat percakapan in-memory per user (window kecil). */
const histories = new Map();

function getHistory(chatId) {
  if (!histories.has(chatId)) histories.set(chatId, []);
  return histories.get(chatId);
}

bot.command('start', async (ctx) => {
  const name = ctx.from?.first_name || 'Bapak/Ibu';
  await ctx.replyWithChatAction('typing');
  // Biarkan SURTI menyapa natural lewat LLM — tanpa template
  try {
    const reply = await askSurti({
      history: [],
      message: `Pengguna baru menekan tombol Start di Telegram. Sapa dia yang bernama ${name} secara hangat sebagai SURTI, perkenalkan singkat, dan ajak bertanya soal panel surya.`,
    });
    await ctx.reply(reply, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply(
      `Halo ${name}! Saya SURTI, konsultan panel surya PT SUNBLIX ENERGI INDONESIA. Ada yang bisa saya bantu seputar panel surya? 😊`
    );
  }
});


const HELP_TEXT = `Halo! Saya SURTI, konsultan panel surya PT SUNBLIX ENERGI INDONESIA. Berikut yang bisa saya bantu:

🔹 Konsultasi kebutuhan panel surya (rumah, ruko, pabrik)
🔹 Hitung estimasi kapasitas kWp dan penghematan tagihan
🔹 Rekomendasi paket SUNBLIX sesuai tagihan listrik Anda
🔹 Simulasi draf penawaran resmi (S.P.H.)
🔹 Kirim katalog resmi SUNBLIX 2026 (PDF)
🔹 Jadwalkan survei lokasi oleh tim kami
🔹 Sambungkan ke tim manusia kami lewat WhatsApp

Cukup ketik pertanyaan Anda secara bebas — saya jawab dalam bahasa Indonesia.`;

bot.command('bantuan', async (ctx) => {
  await ctx.reply(HELP_TEXT);
});

bot.command('katalog', async (ctx) => {
  await ctx.reply(
    `Silakan unduh katalog resmi SUNBLIX 2026 di sini:\nhttps://jasasolarpanelindonesia.sunblix.id/SUNBLIX_KATALOG_2026.pdf\n\nIsinya lengkap: spesifikasi panel, inverter, baterai, dan daftar paket turnkey. 📄`
  );
});

bot.command('konsultasi', async (ctx) => {
  await ctx.replyWithChatAction('typing');
  const name = ctx.from?.first_name || 'Bapak/Ibu';
  try {
    const reply = await askSurti({
      history: [],
      message: `Pengguna ${name} meminta mulai konsultasi panel surya. Mulailah konsultasi dengan menanyakan lokasi pemasangan dan tagihan listrik bulanannya secara hangat.`,
    });
    await ctx.reply(reply, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('Silakan ceritakan lokasi pemasangan dan kisaran tagihan listrik bulanan Anda — saya bantu hitung kebutuhannya. 😊');
  }
});

bot.command('penawaran', async (ctx) => {
  await ctx.replyWithChatAction('typing');
  try {
    const reply = await askSurti({
      history: [],
      message: `Pengguna meminta draf S.P.H. resmi. Minta data yang diperlukan secara natural (nama, lokasi, tagihan, daya, WhatsApp) sebelum menyusun draf. Ingatkan bahwa seluruh S.P.H. berstatus DRAFT hingga disetujui Direksi.`,
    });
    await ctx.reply(reply, { parse_mode: 'Markdown' });
  } catch {
    await ctx.reply('Baik, untuk menyusun draf S.P.H. saya perlu: nama, lokasi pemasangan, tagihan listrik bulanan, daya P.L.N., dan nomor WhatsApp aktif. 📝');
  }
});

bot.command('survei', async (ctx) => {
  await ctx.reply(
    `Siap dijadwalkan! Untuk permintaan survei lokasi, mohon kirimkan:\n- Nama lengkap / P.I.C.\n- Alamat pemasangan (kota/kecamatan)\n- Nomor WhatsApp aktif\n\nTim kami akan menghubungi untuk menentukan jadwal. 📅`
  );
});

bot.command('hubungi', async (ctx) => {
  await ctx.reply(
    `Tim manusia kami siap membantu:\n- WhatsApp: +62 852-8858-1027\n- Email: contact@sunblix.id\n- Web: https://sunblix.id\n\nAtau lanjutkan chat dengan saya dulu — senang sekali membantu! 😊`
  );
});

bot.on('message:text', async (ctx) => {
  const text = ctx.message?.text || '';
  const chatId = ctx.chat?.id;
  const from = ctx.from || {};

  // 1. GATE — TypeSafe Jev dulu, fallback keyword bila error
  const { verdict, via } = await classifyMessage(text);
  console.log(`[gate:${via}] chat=${chatId} verdict=${verdict} :: ${text.slice(0, 60)}`);

  // 2. OFF-TOPIC → SURTI benar-benar diam (jangan balas apa pun)
  if (verdict === 'off_topic') {
    return; // hening total
  }

  // 3. Layani: catat customer & pesan (best-effort)
  let customerId = null;
  if (isDbLive()) {
    const row = await upsertCustomer({
      telegramId: from.id,
      name: from.first_name,
      username: from.username,
    });
    customerId = row?.id || null;
    if (customerId) await logMessage({ customerId, role: 'user', content: text });
  }

  // 4. Jawab via LLM
  const history = getHistory(chatId);
  await ctx.replyWithChatAction('typing');
  try {
    const reply = await askSurti({ history, message: text });
    history.push({ role: 'user', content: text });
    history.push({ role: 'assistant', content: reply });
    await ctx.reply(reply, { parse_mode: 'Markdown' });
    if (isDbLive() && customerId) {
      await logMessage({ customerId, role: 'assistant', content: reply });
    }
  } catch (err) {
    console.error('[surti] LLM error:', err.message);
    await ctx.reply('Maaf, koneksi saya sedang terganggu sesaat. Mohon coba lagi beberapa saat. 🙏');
  }
});

// Foto atap (survey preview) → minta data tekstual dulu
bot.on('message:photo', async (ctx) => {
  await ctx.reply(
    'Terima kasih fotonya! Untuk analisis yang presisi, ceritakan singkat lokasi & jenis atapnya (genteng/spandek/dak), lalu tim survei kami akan memverifikasi langsung ke lokasi. 📸'
  );
});

bot.catch((err) => {
  console.error('[bot] error:', err.error?.message || err.error);
});

console.log('[SURTI] Bot Telegram mulai (long-polling)...');
console.log(`[SURTI] DB: ${isDbLive() ? 'LIVE (Supabase)' : 'memory-only'} | Gate: ${config.typesafe.apiKey ? 'Jev + keyword fallback' : 'keyword'}`);
bot.start();
