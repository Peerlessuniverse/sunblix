import { NextResponse } from 'next/server';
import { getDbClient, isDbLive } from '../../../lib/supabaseClient.js';

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

    // Persist to Supabase (career applications table)
    if (isDbLive()) {
      try {
        const client = getDbClient();
        await client.insert('surti_career_applications', {
          application_number: applicationId,
          full_name: fullName,
          email,
          whatsapp,
          position,
          city: city || null,
          education: education || null,
          experience: experience || null,
          skills: skills || null,
          portfolio_url: portfolioUrl || null,
          expected_salary: expectedSalary || null,
          availability: availability || null,
          bio: bio || null,
          status: 'received',
        });
      } catch (dbErr) {
        console.error('[CAREER] DB write failed:', dbErr.message);
        // Jangan gagalkan respons — lamaran tetap dianggap diterima (tercatat di log)
      }
    }

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
    console.error('[API /api/career] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
