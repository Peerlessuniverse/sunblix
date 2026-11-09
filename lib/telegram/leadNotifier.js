/**
 * Notifikasi ke Telegram untuk tiga jenis Warehouse SUNBLIX:
 *   1. Lead pelanggan     - disuntik di lib/surti/crmService.js recordLead()
 *   2. Kemitraan vendor   - app/api/partnership/route.js
 *   3. Lamaran kerja      - app/api/career/route.js
 *
 * Semua dikirim ke TELEGRAM_ADMIN_CHAT_ID (boleh lebih dari satu, dipisah koma).
 *
 * Guard anti-spam:
 *  - Debounce per kunci (lead id / partner number / application number),
 *    supaya satu entri tidak dikirim dua kali dalam 10 menit.
 *  - Notifikasi gagal TIDAK boleh menggagalkan proses pembuatan data
 *    (fire-and-forget).
 */

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

function shouldSend(key) {
  if (!key) return false;
  const last = notified.get(key);
  const now = Date.now();
  if (last && now - last < DEBOUNCE_MS) return false;
  notified.set(key, now);
  return true;
}

/**
 * Kirim satu pesan ke semua tujuan. Fire-and-forget.
 */
function dispatch(text, key) {
  if (!shouldSend(key)) return { ok: false, reason: 'debounced' };
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const ids = chatIds();
  if (!token || ids.length === 0) {
    console.log('[TelegramNotifier] TELEGRAM_BOT_TOKEN atau TELEGRAM_ADMIN_CHAT_ID belum diatur - notifikasi dilewati.');
    return { ok: false, reason: 'missing_env' };
  }

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
    console.log(`[TelegramNotifier] ${key} dikirim ke ${ok}/${ids.length} tujuan`);
  }).catch((err) => {
    console.error('[TelegramNotifier] gagal mengirim pesan:', err.message);
  });

  return { ok: true, queued: ids.length };
}

/**
 * Lead pelanggan baru.
 * @param {object} lead  record lead dari crmService
 * @param {boolean} isNew true kalau ini lead baru (bukan update)
 */
export function notifyLeadCreated(lead, isNew) {
  if (!isNew) return { ok: false, reason: 'not_new' };
  const id = String(lead?.id || '');
  if (!id) return { ok: false, reason: 'no_id' };

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
  return dispatch(lines.join('\n'), `lead:${id}`);
}

/**
 * Pendaftaran kemitraan vendor baru.
 */
export function notifyPartnershipCreated(p) {
  const no = String(p?.partner_number || p?.partnerNumber || '');
  if (!no) return { ok: false, reason: 'no_number' };

  const pick = (...keys) => {
    for (const k of keys) {
      if (p[k]) return p[k];
    }
    return '';
  };

  const lines = [
    'PENDAFTARAN KEMITRAAN VENDOR BARU - SUNBLIX',
    '',
    `No. Registrasi: ${no}`,
    `Perusahaan: ${pick('company_name', 'companyName') || '-'}`,
    `PIC: ${pick('pic_name', 'picName') || '-'}${pick('pic_position', 'picPosition') ? ` (${pick('pic_position', 'picPosition')})` : ''}`,
    `Kategori: ${pick('category') || '-'}`,
    `Wilayah: ${pick('coverage_area', 'coverageArea') || '-'}`,
    `Email: ${pick('email') || '-'}`,
    `WhatsApp: ${pick('whatsapp') || '-'}`,
  ];
  const katalog = pick('company_profile_url', 'companyProfileUrl');
  if (katalog) lines.push(`Katalog: ${katalog}`);
  if (pick('npwp')) lines.push(`NPWP: ${pick('npwp')}`);
  lines.push('', 'Menunggu tahap kurasi vendor.');
  return dispatch(lines.join('\n'), `partner:${no}`);
}

/**
 * Lamaran kerja / CV baru.
 */
export function notifyCareerApplication(c) {
  const no = String(c?.application_number || c?.applicationNumber || '');
  if (!no) return { ok: false, reason: 'no_number' };

  const pick = (...keys) => {
    for (const k of keys) {
      if (c[k]) return c[k];
    }
    return '';
  };

  const lines = [
    'LAMARAN KERJA BARU MASUK - SUNBLIX',
    '',
    `No. Lamaran: ${no}`,
    `Nama: ${pick('full_name', 'fullName') || '-'}`,
    `Posisi: ${pick('position') || '-'}`,
    `Kota: ${pick('city') || '-'}`,
    `Email: ${pick('email') || '-'}`,
    `WhatsApp: ${pick('whatsapp') || '-'}`,
  ];
  if (pick('education')) lines.push(`Pendidikan: ${String(pick('education')).slice(0, 150)}`);
  if (pick('experience')) lines.push(`Pengalaman: ${String(pick('experience')).slice(0, 200)}`);
  if (pick('skills')) lines.push(`Keahlian: ${String(pick('skills')).slice(0, 150)}`);
  const portofolio = pick('portfolio_url', 'portfolioUrl');
  if (portofolio) lines.push(`Portofolio: ${portofolio}`);
  lines.push('', 'Menunggu pen Screening oleh tim rekrutmen.');
  return dispatch(lines.join('\n'), `career:${no}`);
}
