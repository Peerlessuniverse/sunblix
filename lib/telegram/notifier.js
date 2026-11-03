/**
 * Kirim notifikasi Telegram ke Admin saat ada Form Lead baru masuk
 */
export async function notifyAdminNewLead(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.log('[TelegramNotifier] TELEGRAM_BOT_TOKEN atau TELEGRAM_ADMIN_CHAT_ID belum diatur di .env. Notifikasi Telegram dilewati.');
    return { ok: false, reason: 'missing_env' };
  }

  const billText = lead.monthlyBill ? `Rp ${Number(lead.monthlyBill).toLocaleString('id-ID')}/bln` : '-';
  const text = `🔔 *FORM KEBUTUHAN PLTS BARU MASUK!*

👤 *Nama*: ${lead.name}
📱 *WhatsApp*: ${lead.phone || '-'}
📍 *Lokasi*: ${lead.city || '-'}
⚡ *PLN*: ${lead.plnVa || '-'} VA (${lead.phase || '1 Fasa'}) | Tagihan: ${billText}
🎯 *Tujuan*: ${lead.goal || '-'}
🏠 *Properti*: ${lead.propertyType || 'Rumah'} | Atap: ${lead.roofType || 'Genteng'}
${lead.backupHours ? `⏱️ *Lama Backup*: ${lead.backupHours} Jam\n` : ''}${lead.criticalLoads ? `🔌 *Beban Kritis*: ${lead.criticalLoads}\n` : ''}${lead.notes ? `📝 *Catatan Tambahan*: ${lead.notes}\n` : ''}
👉 *Apakah saya diizinkan untuk memproses analisa engineering & draf penawarannya sekarang, Pak Admin?*
*(Balas "Ya" untuk setuju / "Tidak" untuk abaikan)*`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
    const data = await res.json();
    return { ok: data.ok, data };
  } catch (err) {
    console.error('[TelegramNotifier] Gagal mengirim pesan Telegram:', err.message);
    return { ok: false, error: err.message };
  }
}

