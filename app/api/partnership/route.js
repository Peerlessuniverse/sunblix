import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      companyName,
      picName,
      picPosition,
      email,
      whatsapp,
      category,
      coverageArea,
      website,
      npwp,
      companyProfileUrl,
      pastExperience,
      proposalDescription,
    } = body;

    // Validation
    if (!companyName || !picName || !email || !whatsapp || !category) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama perusahaan, nama PIC, email, nomor WhatsApp, dan kategori kemitraan wajib diisi.',
        },
        { status: 400 }
      );
    }

    // Generate unique vendor partner ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const partnerId = `SBX-VND${new Date().getFullYear()}-${randomSuffix}`;

    console.log(`[SUNBLIX VENDOR PARTNERSHIP INQUIRY] ID: ${partnerId}`, {
      partnerId,
      companyName,
      picName,
      picPosition,
      email,
      whatsapp,
      category,
      coverageArea,
      website,
      npwp,
      companyProfileUrl,
      pastExperience,
      proposalDescription,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      partnerId,
      message: 'Registrasi kemitraan vendor berhasil dikirim. Tim Procurement SUNBLIX akan segera menghubungi Anda.',
      data: {
        partnerId,
        companyName,
        picName,
        category,
        receivedAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      },
    });
  } catch (error) {
    console.error('Error handling partnership API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memproses kemitraan vendor.' },
      { status: 500 }
    );
  }
}
