import { NextResponse } from 'next/server';
import { recordLead, parseBillAmount } from '../../../lib/surti/crmService.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, whatsapp, email, city, plnPower, monthlyBill, propertyType, systemRecommendation, notes } =
      body;

    if (!name || !whatsapp || !email) {
      return NextResponse.json(
        { success: false, message: 'Nama, WhatsApp, dan Email wajib diisi.' },
        { status: 400 }
      );
    }

    // Generate unique official quote reference number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const quoteId = `SBX-Q${new Date().getFullYear()}-${randomSuffix}`;

    // Extract numeric monthly bill
    const billNum = parseBillAmount(monthlyBill);

    // Automatically record into SURTI CRM database
    recordLead({
      customerId: quoteId,
      name,
      phone: whatsapp,
      email,
      customerType: propertyType === 'Pabrik / Gudang' ? 'industrial' : propertyType === 'Ruko / Bisnis' ? 'commercial' : 'residential',
      companyName: '',
      city,
      monthlyBill: billNum,
      propertyType: propertyType || 'house',
      systemType: 'hybrid',
      source: 'Kalkulator Web (Penawaran Resmi)',
      notes: `Daya PLN: ${plnPower || '-'}. Rekomendasi: ${systemRecommendation || '-'}. Catatan: ${notes || '-'}`,
    });

    console.log(`[SUNBLIX QUOTE INQUIRY RECORDED] ID: ${quoteId}`, {
      name,
      whatsapp,
      email,
      city,
      plnPower,
      monthlyBill,
      propertyType,
      systemRecommendation,
      notes,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      quoteId,
      message: 'Permintaan penawaran resmi berhasil diterima. Tim engineer kami akan menghubungi Anda.',
      data: {
        quoteId,
        name,
        systemRecommendation,
      },
    });
  } catch (error) {
    console.error('Error handling quote API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem internal.' },
      { status: 500 }
    );
  }
}
