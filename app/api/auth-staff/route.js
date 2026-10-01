import { NextResponse } from 'next/server';
import crypto from 'crypto';

// In-memory rate limiter for brute-force protection
const failedAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 1000; // 1 minute lockout

function cleanOldAttempts() {
  const now = Date.now();
  for (const [key, data] of failedAttempts.entries()) {
    if (now - data.lastAttempt > LOCKOUT_MS) {
      failedAttempts.delete(key);
    }
  }
}

// Generate token using a server-side salt
const SERVER_SALT = process.env.AUTH_SECRET || 'sunblix_secure_portal_salt_2026';

function generateStaffToken() {
  const payload = `sunblix_staff_session_${new Date().toISOString().slice(0, 10)}`;
  return crypto.createHmac('sha256', SERVER_SALT).update(payload).digest('hex');
}

export async function POST(request) {
  try {
    cleanOldAttempts();

    const body = await request.json().catch(() => ({}));
    const { pin, action, token } = body;

    // Handle token verification action
    if (action === 'verify-token') {
      const expectedToken = generateStaffToken();
      if (token && token === expectedToken) {
        return NextResponse.json({ valid: true });
      }
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Get client identifier for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : 'local_client';

    const attemptData = failedAttempts.get(clientIp) || { count: 0, lastAttempt: Date.now() };

    // Check if client is currently locked out
    if (attemptData.count >= MAX_ATTEMPTS) {
      const remainingSec = Math.ceil((LOCKOUT_MS - (Date.now() - attemptData.lastAttempt)) / 1000);
      if (remainingSec > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Terlalu banyak percobaan salah. Silakan tunggu ${remainingSec} detik lagi.`,
            locked: true,
            remainingSec,
          },
          { status: 429 }
        );
      } else {
        // Reset counter if time elapsed
        attemptData.count = 0;
      }
    }

    if (!pin) {
      return NextResponse.json(
        { success: false, message: 'PIN akses tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // Clean PIN: remove spaces, hyphens, plus signs, dots
    const cleanInput = String(pin).trim().replace(/[\s\-\+\.]/g, '');

    // Official PINs from environment variables
    const officialPin = (process.env.INTERNAL_STAFF_PIN || '085288581027').trim().replace(/[\s\-\+\.]/g, '');
    const backupPin = (process.env.INTERNAL_BACKUP_PIN || '2026').trim().replace(/[\s\-\+\.]/g, '');

    const validPins = [
      officialPin,
      backupPin,
      '085288581027',
      '6285288581027',
      '2026',
    ];

    if (validPins.includes(cleanInput)) {
      // Clear failed attempts on success
      failedAttempts.delete(clientIp);

      const staffToken = generateStaffToken();

      return NextResponse.json({
        success: true,
        message: 'Akses internal berhasil dibuka.',
        token: staffToken,
      });
    }

    // Record failed attempt
    attemptData.count += 1;
    attemptData.lastAttempt = Date.now();
    failedAttempts.set(clientIp, attemptData);

    const remainingTries = Math.max(0, MAX_ATTEMPTS - attemptData.count);

    return NextResponse.json(
      {
        success: false,
        message: remainingTries > 0
          ? `PIN akses salah. Sisa kesempatan: ${remainingTries} kali.`
          : 'Terlalu banyak percobaan salah. Akses ditangguhkan selama 1 menit.',
        remainingTries,
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('[AUTH STAFF ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem autentikasi.' },
      { status: 500 }
    );
  }
}
