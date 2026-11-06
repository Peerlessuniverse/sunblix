import { NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from './lib/auth/staffAuth.js';

/**
 * NEXT.JS 16 PROXY (SERVER-SIDE GATEWAY)
 * Convention: proxy.js in workspace root.
 * Protects internal staff routes (/DashboardOs, /surti/admin) on the server side.
 * Routes subdomain requests (dashboardv2.sunblix.id, analisa.sunblix.id).
 */
export function proxy(request) {
  const { pathname } = request.nextUrl;
  const forwardedHost = request.headers.get('x-forwarded-host');
  const rawHost = request.headers.get('host');
  const host = (forwardedHost || rawHost || '').toLowerCase();

  // Subdomain analisa.sunblix.id:
  // Akses root atau token slug (mis. /030-arga-3eb687a3) di-rewrite ke /analisa/...
  if (host.includes('analisa')) {
    if (pathname === '/' || pathname === '') {
      return NextResponse.rewrite(new URL('/analisa', request.url));
    }
    if (!pathname.startsWith('/analisa')) {
      const cleanPath = pathname.replace(/\/+$/, '');
      return NextResponse.rewrite(new URL(`/analisa${cleanPath}`, request.url));
    }
  }

  // Khusus subdomain dashboardv2.sunblix.id:
  // Akses ke root (/) langsung otomatis diarahkan ke /dashboardv2
  if (host.includes('dashboardv2') && (pathname === '/' || pathname === '')) {
    return NextResponse.redirect(new URL('/dashboardv2', request.url));
  }

  // Public SURTI chat page is closed (SURTI is private) unless explicitly
  // re-enabled. /surti/admin stays protected by the staff check below, and
  // /surti/sph/[id] proposal links stay reachable.
  if (pathname === '/surti' || pathname === '/surti/') {
    if (String(process.env.SURTI_PUBLIC_ENABLED || '').toLowerCase() !== 'true') {
      return new NextResponse('Not Found', { status: 404 });
    }
    return NextResponse.next();
  }

  // Protected route patterns
  const isDashboardOs = pathname === '/DashboardOs' || pathname.startsWith('/DashboardOs/');
  const isDashboardV2 = pathname === '/dashboardv2' || pathname.startsWith('/dashboardv2');
  const isSurtiAdmin = pathname === '/surti/admin' || pathname.startsWith('/surti/admin/');

  // Allow unrestricted access to the dedicated login page
  if (pathname === '/DashboardOs/login') {
    return NextResponse.next();
  }

  if (isDashboardOs || isDashboardV2 || isSurtiAdmin) {
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
    '/((?!_next/static|_next/image|favicon.ico|asset/|engineering/).*)',
  ],
};
