import { NextResponse } from 'next/server';
import { recordLead, isLikelySpamLead, parseBillAmount } from '../../../../lib/surti/crmService.js';
import { notifyAdminNewLead } from '../../../../lib/telegram/notifier.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      email,
      city,
      propertyType = 'Rumah',
      plnVa = 5500,
      phase = '1 Fasa',
      monthlyBill = 2500000,
      goal = 'Hemat + Backup Pemadaman',
      backupHours = 0,
      criticalLoads = '',
      roofType = 'Genteng',
      roofArea = 0,
      cableDistance = 20,
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

    const billNum = parseBillAmount(monthlyBill) || 2500000;
    const refCode = `SBX-FORM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const fullNotes = [
      `[FORM KONSULTASI RESMI SUNBLIX]`,
      `Ref: ${refCode}`,
      `Daya PLN: ${plnVa} VA (${phase})`,
      `Tagihan: Rp ${billNum.toLocaleString('id-ID')}/bln`,
      `Tipe Properti: ${propertyType}`,
      `Tujuan Sistem: ${goal}`,
      backupHours > 0 ? `Lama Backup: ${backupHours} Jam` : null,
      criticalLoads ? `Beban Kritis: ${criticalLoads}` : null,
      `Tipe Atap: ${roofType} (Est. ${roofArea} m2)`,
      cableDistance ? `Jarak Kabel ke Panel: ~${cableDistance} meter` : null,
      notes ? `Catatan Tambahan: ${notes}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    // Catat ke CRM Supabase (dengan crmApproved = false agar menunggu persetujuan Admin)
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
      roofType,
      backupHours,
      criticalLoads,
      notes,
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
