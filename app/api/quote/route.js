import { NextResponse } from 'next/server';

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

    /*
      ==================================================================
      INTEGRASI EMAIL / SMTP (HOSTINGER / RESEND):
      ------------------------------------------------------------------
      Jika Anda sudah memiliki akun Hostinger:
      const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER, // e.g. penawaran@sunblix.com
          pass: process.env.SMTP_PASS,
        }
      });
      ==================================================================
    */

    console.log(`[SUNBLIX QUOTE INQUIRY] ID: ${quoteId}`, {
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
