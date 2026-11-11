import { NextResponse } from 'next/server';
import { getDbClient, isDbLive } from '../../../lib/supabaseClient.js';
import { verifyRequestAuth } from '../../../lib/auth/staffAuth.js';
import { notifyCareerApplication } from '../../../lib/telegram/leadNotifier.js';

export async function GET(request) {
  try {
    const auth = verifyRequestAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Sesi staf tidak valid.' },
        { status: 401 }
      );
    }

    if (!isDbLive()) {
      return NextResponse.json({
        success: true,
        applications: [],
        message: 'Database persistence mode: Demo / In-memory',
      });
    }

    const client = getDbClient();
    const applications = await client
      .from('surti_career_applications')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      applications: Array.isArray(applications) ? applications : [],
    });
  } catch (error) {
    console.error('[API /api/career GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data pelamar kerja.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const auth = verifyRequestAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Sesi staf tidak valid.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    const allowedStatuses = ['received', 'reviewing', 'interview_scheduled', 'accepted', 'rejected'];
    if (!id || !status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'ID dan status lamaran valid wajib disertakan.' },
        { status: 400 }
      );
    }

    if (!isDbLive()) {
      return NextResponse.json({
        success: true,
        message: 'Status pelamar berhasil diperbarui (demo mode).',
      });
    }

    const client = getDbClient();
    const updated = await client.update(
      'surti_career_applications',
      { id },
      { status, updated_at: new Date().toISOString() }
    );

    return NextResponse.json({
      success: true,
      message: 'Status pelamar berhasil diperbarui.',
      data: updated,
    });
  } catch (error) {
    console.error('[API /api/career PATCH] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui status pelamar.' },
      { status: 500 }
    );
  }
}

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

    // Generate unique applicant ID.
    const year = new Date().getFullYear();
    const client = isDbLive() ? getDbClient() : null;
    let applicationId = null;

    if (client) {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const candidate = `SBX-HR${year}-${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          const clash = await client
            .from('surti_career_applications')
            .select('application_number')
            .eq('application_number', candidate)
            .maybeSingle();
          if (!clash) {
            applicationId = candidate;
            break;
          }
        } catch (clashErr) {
          console.error('[CAREER] cek duplikat gagal:', clashErr.message);
          break;
        }
      }
    }

    if (!applicationId) {
      applicationId = `SBX-HR${year}-${Date.now().toString().slice(-6)}`;
    }

    // Persist to Supabase (career applications table)
    if (client) {
      let dbErr = null;
      try {
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
      } catch (err) {
        dbErr = err;
      }

      if (dbErr) {
        console.error('[CAREER] DB write failed:', dbErr.message);
        return NextResponse.json(
          {
            success: false,
            message:
              'Lamaran belum dapat disimpan karena ada gangguan pada server. Silakan coba lagi beberapa saat lagi, atau hubungi tim rekrutmen SUNBLIX.',
          },
          { status: 503 }
        );
      }
    }

    // Notifikasi ke Telegram (grup + admin)
    try {
      notifyCareerApplication({
        application_number: applicationId,
        full_name: fullName,
        email,
        whatsapp,
        position,
        city,
        education,
        experience,
        skills,
        portfolio_url: portfolioUrl,
        expected_salary: expectedSalary,
        availability,
        bio,
      });
    } catch (err) {
      console.error('[CAREER] notifikasi gagal:', err.message);
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
