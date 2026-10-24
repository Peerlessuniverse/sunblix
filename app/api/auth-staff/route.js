import { NextResponse } from 'next/server';
import {
  getAuthSecret,
  getValidStaffPins,
  normalizePin,
  generateSessionToken,
  verifySessionToken,
  createSessionCookie,
  createClearSessionCookie,
  verifyStaffCredentials,
} from '../../../lib/auth/staffAuth.js';

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

export async function POST(request) {
  try {
    cleanOldAttempts();

    const body = await request.json().catch(() => ({}));
    const { pin, action, token, username, password } = body;

    // ------------------------------------------------------------------------
    // Action 1: Verify existing session token
    // ------------------------------------------------------------------------
    if (action === 'verify-token') {
      const auth = token ? verifySessionToken(token) : verifyRequestAuth(request);
      if (auth.valid) {
        return NextResponse.json({ valid: true, user: auth.payload?.user || null });
      }
      return NextResponse.json(
        { valid: false, message: 'Sesi kedaluwarsa atau tidak valid.' },
        { status: 401 }
      );
    }

    // ------------------------------------------------------------------------
    // Action 2: Logout and clear HttpOnly cookie
    // ------------------------------------------------------------------------
    if (action === 'logout') {
      const res = NextResponse.json({ success: true, message: 'Sesi staf berhasil diakhiri.' });
      res.headers.set('Set-Cookie', createClearSessionCookie());
      return res;
    }

    // Client identifier for rate limiting
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
        attemptData.count = 0;
      }
    }

    // Server configuration check: AUTH_SECRET must be configured
    const authSecret = getAuthSecret();
    if (!authSecret) {
      console.error('[AUTH_STAFF] Server misconfiguration: AUTH_SECRET is not configured or too short.');
      return NextResponse.json(
        { success: false, message: 'Konfigurasi server otentikasi belum lengkap. Hubungi administrator.' },
        { status: 500 }
      );
    }

    // ------------------------------------------------------------------------
    // Action 3: Login via Username & Password (DashboardOS)
    // ------------------------------------------------------------------------
    if (action === 'login-password' || (username && password)) {
      if (!username || !password) {
        return NextResponse.json(
          { success: false, message: 'ID Staf dan kata sandi wajib diisi.' },
          { status: 400 }
        );
      }

      const credRes = verifyStaffCredentials(username, password);
      if (credRes.valid) {
        failedAttempts.delete(clientIp);

        const staffToken = generateSessionToken('staff', credRes.user);
        const response = NextResponse.json({
          success: true,
          message: 'Autentikasi staf berhasil.',
          user: credRes.user,
          token: staffToken,
        });

        response.headers.set('Set-Cookie', createSessionCookie(staffToken));
        return response;
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
            ? `ID Staf atau kata sandi tidak valid. Sisa kesempatan: ${remainingTries} kali.`
            : 'Terlalu banyak percobaan salah. Akses ditangguhkan selama 1 menit.',
          remainingTries,
        },
        { status: 401 }
      );
    }

    // ------------------------------------------------------------------------
    // Action 4: Login via Staff PIN (Brosur / SPH Editor)
    // ------------------------------------------------------------------------
    if (pin !== undefined) {
      if (!pin) {
        return NextResponse.json(
          { success: false, message: 'PIN akses tidak boleh kosong.' },
          { status: 400 }
        );
      }

      const validPins = getValidStaffPins();
      if (validPins.length === 0) {
        console.error('[AUTH_STAFF] Server misconfiguration: INTERNAL_STAFF_PIN is not configured.');
        return NextResponse.json(
          { success: false, message: 'Konfigurasi PIN server belum disetel di environment variables.' },
          { status: 500 }
        );
      }

      const cleanInput = normalizePin(pin);

      if (validPins.includes(cleanInput)) {
        failedAttempts.delete(clientIp);

        const staffToken = generateSessionToken('staff', { name: 'Staff Editor', role: 'Staff' });
        const response = NextResponse.json({
          success: true,
          message: 'Akses internal staf berhasil dibuka.',
          token: staffToken,
        });

        response.headers.set('Set-Cookie', createSessionCookie(staffToken));
        return response;
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
    }

    return NextResponse.json(
      { success: false, message: 'Permintaan autentikasi tidak valid.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[AUTH STAFF ERROR]', error.message);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem autentikasi.' },
      { status: 500 }
    );
  }
}
