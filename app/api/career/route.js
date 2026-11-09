import { NextResponse } from 'next/server';
import { getDbClient, isDbLive } from '../../../lib/supabaseClient.js';
import { notifyCareerApplication } from '../../../lib/telegram/leadNotifier.js';

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
    // Suffiks 4 digit acak bisa bentrok antar pelamar - cek dulu ke database
    // supaya tidak ada dua lamaran memakai nomor yang sama.
    const year = new Date().getFullYear();
    const client = isDbLive() ? getDbClient() : null;
    let applicationId = null;

    if (client) {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const candidate = `SBX-HR${year}-${Math.floor(1000 + Math.random() * 9000)}`;
        try {
          // maybeSingle() pada client internal ini mengembalikan row langsung
          // (null kalau tidak ada), bukan objek {data, error}.
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
        // insert() pada client internal ini melempar exception saat gagal.
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
        // Lamaran BELUM tersimpan. Kalau tetap balas "berhasil", pelamar memegang
        // nomor lamaran yang tidak ada di database. Lebih baik gagalkan dengan jelas.
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

    // Notifikasi ke Telegram (grup + admin): lamaran kerja baru.
    // Fire-and-forget, tidak boleh menggagalkan respons lamaran.
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
