import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      whatsapp,
      position,
      city,
      education,
      experience,
      skills,
      portfolioUrl,
      expectedSalary,
      availability,
      bio,
    } = body;

    // Validation
    if (!fullName || !email || !whatsapp || !position) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nama lengkap, email, nomor WhatsApp, dan posisi yang dilamar wajib diisi.',
        },
        { status: 400 }
      );
    }

    // Generate unique applicant ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationId = `SBX-HR${new Date().getFullYear()}-${randomSuffix}`;

    console.log(`[SUNBLIX CAREER APPLICATION] ID: ${applicationId}`, {
      applicationId,
      fullName,
      email,
      whatsapp,
      position,
      city,
      education,
      experience,
      skills,
      portfolioUrl,
      expectedSalary,
      availability,
      bio,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      applicationId,
      message: 'Biodata lamaran kerja berhasil kami terima. Tim HR SUNBLIX akan meninjau kualifikasi Anda.',
      data: {
        applicationId,
        fullName,
        position,
        receivedAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      },
    });
  } catch (error) {
    console.error('Error handling career application API:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat memproses biodata lamaran.' },
      { status: 500 }
    );
  }
}
