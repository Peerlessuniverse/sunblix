/**
 * ============================================================================
 * SUNBLIX PHASE 1 REAL HTTP INTEGRATION TEST SUITE
 * ============================================================================
 * Starts Next.js dev server on a designated port (e.g. 3005),
 * executes real HTTP fetch requests against routes, and shuts down the server.
 *
 * Verifies:
 * 1. POST /api/auth-staff with invalid credentials -> 401
 * 2. POST /api/auth-staff with valid credentials -> 200 + sets HttpOnly cookie
 * 3. GET /api/surti/crm (anonymous) -> 401 Unauthorized
 * 4. GET /api/surti/crm (with session cookie) -> 200 OK
 * 5. DELETE /api/surti/crm (anonymous) -> 401 Unauthorized
 * 6. DELETE /api/surti/sph (anonymous) -> 401 Unauthorized
 * 7. POST /api/surti/sph (action: approve, anonymous) -> 401 Unauthorized
 * 8. GET /api/surti/sph (list all, anonymous) -> 401 Unauthorized
 * 9. GET /api/surti/sph?id=demo (individual preview) -> 200 / 404 (Allowed without auth)
 * 10. POST /api/auth-staff (action: logout) -> 200 + clears session cookie
 * 11. GET /DashboardOs without cookie -> 307 / 308 redirect to /DashboardOs/login
 */

import { spawn } from 'child_process';
import http from 'http';

const TEST_PORT = 3005;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isServerReady(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/surti/calculate`, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runIntegrationTests() {
  console.log('\n============================================================');
  console.log('🚀 SUNBLIX PHASE 1 REAL HTTP INTEGRATION TEST SUITE');
  console.log(`📡 Spawning Next.js server on port ${TEST_PORT}...`);
  console.log('============================================================\n');

  // Launch Next.js dev server
  const serverProcess = spawn('npx', ['next', 'dev', '-p', String(TEST_PORT)], {
    shell: true,
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
    },
    stdio: 'pipe',
  });

  serverProcess.stdout.on('data', (d) => {
    const s = d.toString();
    if (s.includes('Ready in') || s.includes('started server')) {
      console.log(`  [Next.js]: ${s.trim()}`);
    }
  });

  serverProcess.stderr.on('data', (d) => {
    // suppress dev noise
  });

  // Wait for server to be responsive
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await wait(1000);
    ready = await isServerReady(TEST_PORT);
    if (ready) break;
  }

  if (!ready) {
    serverProcess.kill();
    console.error('Failed to start Next.js test server within 30s.');
    process.exit(1);
  }

  console.log(`  ✓ Server is online and ready at ${BASE_URL}\n`);

  try {
    let sessionCookie = '';

    // Test 1: Invalid Login
    console.log('--- 1. Testing DashboardOS Staff Login ---');
    const invalidLoginRes = await fetch(`${BASE_URL}/api/auth-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login-password',
        username: 'wronguser',
        password: 'wrongpassword',
      }),
    });
    const invalidLoginJson = await invalidLoginRes.json();
    assert(invalidLoginRes.status === 401 && invalidLoginJson.success === false, 'Invalid login rejected with HTTP 401');

    // Test 2: Valid Login
    const validLoginRes = await fetch(`${BASE_URL}/api/auth-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login-password',
        username: 'danny@sunblix.id',
        password: process.env.STAFF_PASSWORD || 'sunblix2026',
      }),
    });
    const validLoginJson = await validLoginRes.json();
    const setCookieHeader = validLoginRes.headers.get('set-cookie') || '';
    assert(validLoginRes.status === 200 && validLoginJson.success === true, 'Valid login accepted with HTTP 200');
    assert(setCookieHeader.includes('sunblix_staff_session=') && setCookieHeader.includes('HttpOnly'), 'Response sets HttpOnly session cookie');

    // Extract cookie for subsequent tests
    const match = setCookieHeader.match(/sunblix_staff_session=([^;]+)/);
    sessionCookie = match ? match[0] : '';

    // Test 3 & 4: Protected CRM Endpoints
    console.log('\n--- 2. Testing CRM Data Protection (GET & DELETE) ---');
    const anonCrmGetRes = await fetch(`${BASE_URL}/api/surti/crm?type=leads`);
    assert(anonCrmGetRes.status === 401, 'Anonymous GET /api/surti/crm?type=leads rejected with HTTP 401');

    const authCrmGetRes = await fetch(`${BASE_URL}/api/surti/crm?type=leads`, {
      headers: { cookie: sessionCookie },
    });
    const authCrmGetJson = await authCrmGetRes.json();
    assert(authCrmGetRes.status === 200 && authCrmGetJson.success === true, 'Authenticated GET /api/surti/crm succeeds with HTTP 200');

    const anonCrmDeleteRes = await fetch(`${BASE_URL}/api/surti/crm`, { method: 'DELETE' });
    assert(anonCrmDeleteRes.status === 401, 'Anonymous DELETE /api/surti/crm rejected with HTTP 401');

    // Test 5, 6, 7: Protected SPH Endpoints
    console.log('\n--- 3. Testing SPH Proposal Protection ---');
    const anonSphDeleteRes = await fetch(`${BASE_URL}/api/surti/sph`, { method: 'DELETE' });
    assert(anonSphDeleteRes.status === 401, 'Anonymous DELETE /api/surti/sph rejected with HTTP 401');

    const anonSphApproveRes = await fetch(`${BASE_URL}/api/surti/sph`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', sphId: 'SPH-TEST-01' }),
    });
    assert(anonSphApproveRes.status === 401, 'Anonymous approval of SPH rejected with HTTP 401');

    const anonSphListRes = await fetch(`${BASE_URL}/api/surti/sph`);
    assert(anonSphListRes.status === 401, 'Anonymous listing of all SPH proposals rejected with HTTP 401');

    const publicSphPreviewRes = await fetch(`${BASE_URL}/api/surti/sph?id=non_existent_sph_01`);
    assert(publicSphPreviewRes.status === 404 || publicSphPreviewRes.status === 200, 'Public SPH preview by ID accessible without 401 (404 for missing ID)');

    // Test 8: Logout Cookie Clearance
    console.log('\n--- 4. Testing Logout & Cookie Expiry ---');
    const logoutRes = await fetch(`${BASE_URL}/api/auth-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    const logoutCookie = logoutRes.headers.get('set-cookie') || '';
    assert(logoutRes.status === 200 && logoutCookie.includes('Max-Age=0'), 'Logout clears session cookie with Max-Age=0');

    // Test 9: Proxy.js Route Protection
    console.log('\n--- 5. Testing Next.js 16 Proxy Protection ---');
    const anonDashboardRes = await fetch(`${BASE_URL}/DashboardOs`, {
      redirect: 'manual',
    });
    assert(
      anonDashboardRes.status === 307 || anonDashboardRes.status === 308 || anonDashboardRes.status === 302,
      `Unauthenticated access to /DashboardOs redirected (Status: ${anonDashboardRes.status})`
    );
    const redirectLocation = anonDashboardRes.headers.get('location') || '';
    assert(redirectLocation.includes('/DashboardOs/login'), 'Redirect destination is /DashboardOs/login');

  } finally {
    console.log('\n🧹 Shutting down Next.js test server...');
    serverProcess.kill();
    // On Windows, tree-kill process
    spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t'], { shell: true });
    await wait(1500);
  }

  console.log('\n============================================================');
  console.log(`🏁 REAL HTTP TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runIntegrationTests().catch((err) => {
  console.error('Integration test runner error:', err);
  process.exit(1);
});
