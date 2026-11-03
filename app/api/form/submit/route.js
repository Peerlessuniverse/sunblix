import { NextResponse } from 'next/server';
import { recordLead, isLikelySpamLead, parseBillAmount } from '../../../../lib/surti/crmService.js';
import { notifyAdminNewLead } from '../../../../lib/telegram/notifier.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      // A. DATA CUSTOMER
      name,
      phone,
      email,
      city,
      shareLoc = '',
      propertyType = 'Rumah',
      propertyUnits = '1',

      // B. LISTRIK PLN
      plnVa = 2200,
      phase = '1 Fasa',
      meterType = 'Token',
      monthlyBill = 800000,
      outageFrequency = 'Jarang',

      // C. KEBUTUHAN
      goal = 'Hemat Tagihan (On-Grid)',
      backupHours = 0,
      criticalLoads = '',
      heavyLoads = '',
      usageTime = 'Malam',

      // D. ATAP & LOKASI
      roofType = 'Genteng',
      roofArea = '30 m²',
      roofShadow = 'Tidak ada',
      cableDistance = 'Kurang tahu',
      notes = '',
    } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Nama dan Nomor WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    // Bersihkan nomor WhatsApp ke format Indonesia (62...)
    let canonicalPhone = String(phone).replace(/\D/g, '');
    if (canonicalPhone.startsWith('0')) {
      canonicalPhone = `62${canonicalPhone.slice(1)}`;
    } else if (canonicalPhone.startsWith('8')) {
      canonicalPhone = `62${canonicalPhone}`;
    }

    if (isLikelySpamLead({ name, phone: canonicalPhone, email })) {
      return NextResponse.json(
        { success: false, message: 'Data yang dikirim terdeteksi tidak valid.' },
        { status: 400 }
      );
    }

    const billNum = parseBillAmount(monthlyBill) || 800000;
    const refCode = `SBX-FORM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const fullNotes = [
      `[SURVEY DATA RESMI SUNBLIX - REF: ${refCode}]`,
      `--- A. DATA CUSTOMER ---`,
      `1. Nama & PIC: ${name.trim()}`,
      `2. No. WA & Email: ${canonicalPhone} ${email ? `| ${email}` : ''}`,
      `3. Alamat Lokasi: ${city || '-'} ${shareLoc ? `(${shareLoc})` : ''}`,
      `4. Jenis Bangunan: ${propertyType}`,
      `5. Jumlah Unit: ${propertyUnits}`,
      ``,
      `--- B. LISTRIK PLN ---`,
      `6. Daya PLN & Fase: ${plnVa} VA (${phase})`,
      `7. Meteran PLN: ${meterType}`,
      `8. Rata-Rata Tagihan/Token: Rp ${billNum.toLocaleString('id-ID')} /bln`,
      `9. Frekuensi Padam: ${outageFrequency}`,
      ``,
      `--- C. KEBUTUHAN ---`,
      `10. Tujuan Utama: ${goal}`,
      backupHours > 0 ? `11. Lama Backup Diinginkan: ${backupHours} Jam` : null,
      criticalLoads ? `12. Beban Wajib Nyala (Padam): ${criticalLoads}` : null,
      heavyLoads ? `13. Peralatan Besar: ${heavyLoads}` : null,
      `14. Waktu Pemakaian Dominan: ${usageTime}`,
      ``,
      `--- D. ATAP & LOKASI ---`,
      `15. Jenis Atap & Luas: ${roofType} (${roofArea || '-'})`,
      `16. Arah Atap & Bayangan: ${roofShadow}`,
      `17. Jarak Atap ke Panel & Inverter: ${cableDistance}`,
      notes ? `Catatan Khusus: ${notes}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    // Catat ke CRM Supabase
    const leadRecord = recordLead({
      customerId: refCode,
      name: name.trim(),
      phone: canonicalPhone,
      email: email ? email.trim() : `${canonicalPhone}@leads.sunblix.id`,
      customerType: propertyType.toLowerCase().includes('pabrik')
        ? 'industrial'
        : propertyType.toLowerCase().includes('ruko') || propertyType.toLowerCase().includes('bisnis')
        ? 'commercial'
        : 'residential',
      city: city ? city.trim() : 'Indonesia',
      monthlyBill: billNum,
      propertyType,
      systemType: goal.toLowerCase().includes('backup') || goal.toLowerCase().includes('hybrid') ? 'hybrid' : 'ongrid',
      source: 'Microsite Form Web',
      notes: fullNotes,
      crmApproved: false, // Menunggu persetujuan Admin via Telegram SURTI
    });

    // Kirim notifikasi Telegram ke Admin (jika token Telegram aktif)
    await notifyAdminNewLead({
      name: name.trim(),
      phone: canonicalPhone,
      city: city || '-',
      monthlyBill: billNum,
      plnVa,
      phase,
      goal,
      propertyType,
      roofType: `${roofType} (${roofArea || '-'})`,
      backupHours,
      criticalLoads: criticalLoads || heavyLoads,
      notes: `Meteran: ${meterType} | Pemakaian: ${usageTime} | Padam: ${outageFrequency} | Alat: ${heavyLoads}`,
    });

    return NextResponse.json({
      success: true,
      refCode,
      leadId: leadRecord?.id,
      message: 'Formulir kebutuhan PLTS Anda berhasil diterima. Tim engineering SUNBLIX & SURTI akan segera menyiapkan analisa teknis untuk Anda.',
    });
  } catch (error) {
    console.error('[API /api/form/submit] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memproses formulir.' },
      { status: 500 }
    );
  }
}
