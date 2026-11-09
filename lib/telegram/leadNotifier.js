/**
 * Notifikasi lead baru ke Telegram (grup + admin).
 *
 * Disuntikkan di lib/surti/crmService.js pada recordLead(), sehingga SEMUA
 * sumber lead (form web, kalkulator, katalog, intake SURTI) memberi notifikasi
 * - bukan hanya form web seperti sebelumnya.
 *
 * Guard anti-spam:
 *  - Hanya untuk lead BARU (record.createdAt == now). Lead yang di-update
 *    (existing) tidak memicu notifikasi lagi.
 *  - Debounce per lead: id yang sama tidak dikirim dua kali dalam 10 menit.
 *  - Notifikasi gagal TIDAK boleh menggagalkan pembuatan lead (fire-and-forget).
 */

const NOTIFIED_KEY = 'surti_lead_notified_at';
const DEBOUNCE_MS = 10 * 60 * 1000;
const notified = new Map();

function chatIds() {
  const raw = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
  return raw.split(',').map((id) => id.trim()).filter(Boolean);
}

function formatRupiah(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return '-';
  return `Rp ${Math.round(v).toLocaleString('id-ID')}`;
}

/**
 * @param {object} lead  record lead dari crmService
 * @param {boolean} isNew true kalau ini lead baru (bukan update)
 */
export function notifyLeadCreated(lead, isNew) {
  if (!isNew) return { ok: false, reason: 'not_new' };
  const id = String(lead?.id || '');
  if (!id) return { ok: false, reason: 'no_id' };

  const last = notified.get(id);
  const now = Date.now();
  if (last && now - last < DEBOUNCE_MS) {
    return { ok: false, reason: 'debounced' };
  }
  notified.set(id, now);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const ids = chatIds();
  if (!token || ids.length === 0) {
    return { ok: false, reason: 'missing_env' };
  }

  const bill = lead.monthlyBill ? `${formatRupiah(lead.monthlyBill)}/bln` : '-';
  const lines = [
    'LEAD BARU MASUK - SUNBLIX',
    '',
    `Nama: ${lead.name || '-'}`,
    `WhatsApp: ${lead.phone || '-'}`,
    `Lokasi: ${lead.city || '-'}`,
    `Tagihan: ${bill}`,
    `Sumber: ${lead.source || '-'}`,
  ];
  if (lead.notes) {
    // hanya 3 baris pertama notes supaya tidak membanjiri chat
    const notes = String(lead.notes).split('\n').slice(0, 3).join(' / ').slice(0, 300);
    lines.push(`Catatan: ${notes}`);
  }
  lines.push('', 'Lead ini akan diproses dan laporannya dikirim ke grup.');
  const text = lines.join('\n');

  // fire-and-forget: jangan pernah await di jalur pembuatan lead
  Promise.allSettled(
    ids.map(async (chatId) => {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      return res.json();
    })
  ).then((settled) => {
    const ok = settled.filter((s) => s.status === 'fulfilled' && s.value?.ok).length;
    console.log(`[TelegramNotifier] lead ${id} dikirim ke ${ok}/${ids.length} tujuan`);
  }).catch((err) => {
    console.error('[TelegramNotifier] gagal kirim notifikasi lead:', err.message);
  });

  return { ok: true, queued: ids.length };
}
