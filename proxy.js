import { NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from './lib/auth/staffAuth.js';

/**
 * NEXT.JS 16 PROXY (SERVER-SIDE GATEWAY)
 * Convention: proxy.js in workspace root.
 * Protects internal staff routes (/DashboardOs, /surti/admin) on the server side.
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Protected route patterns
  const isDashboardOs = pathname === '/DashboardOs' || pathname.startsWith('/DashboardOs/');
  const isSurtiAdmin = pathname === '/surti/admin' || pathname.startsWith('/surti/admin/');

  // Allow unrestricted access to the dedicated login page
  if (pathname === '/DashboardOs/login') {
    return NextResponse.next();
  }

  if (isDashboardOs || isSurtiAdmin) {
    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
    const authHeader = request.headers.get('authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    const token = sessionCookie || bearerToken;
    const verification = verifySessionToken(token);

    if (!verification.valid) {
      // Server-side redirect to staff login page with return url
      const loginUrl = new URL('/DashboardOs/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/DashboardOs/:path*',
    '/surti/admin/:path*',
  ],
};
