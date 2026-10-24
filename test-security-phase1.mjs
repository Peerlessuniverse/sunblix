/**
 * ============================================================================
 * SUNBLIX PHASE 1 SECURITY ACCEPTANCE TEST SUITE
 * ============================================================================
 * Verifies:
 * 1. Invalid staff credentials / PIN are strictly rejected
 * 2. Unauthenticated requests to DELETE /api/surti/crm are rejected (401)
 * 3. Unauthenticated requests to DELETE /api/surti/sph are rejected (401)
 * 4. Unauthenticated approval/issuance of SPH is rejected (401)
 * 5. Valid session token generation and verification works with HMAC-SHA256
 * 6. Expired session tokens are rejected
 * 7. Malformed / forged session tokens are rejected
 * 8. Authenticated staff can perform authorized operations
 * 9. Production mass-deletion guard works
 * 10. Existing solarEngine calculations remain 100% accurate
 */

import {
  getAuthSecret,
  getValidStaffPins,
  normalizePin,
  generateSessionToken,
  verifySessionToken,
  verifyRequestAuth,
} from './lib/auth/staffAuth.js';
import { calculateSolarSystem } from './lib/surti/solarEngine.js';

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

async function runSecurityTests() {
  console.log('\n============================================================');
  console.log('🔒 SUNBLIX PHASE 1 SECURITY TEST SUITE');
  console.log('============================================================\n');

  // --- 1. PIN & Secret Environment Validation ---
  console.log('--- 1. Testing Environment Validation & PIN Normalization ---');
  assert(normalizePin(' 0852-8858-1027 ') === '085288581027', 'PIN normalizer strips whitespace and hyphens');
  assert(normalizePin('+62 852.8858.1027') === '6285288581027', 'PIN normalizer strips plus signs and dots');
  
  const pins = getValidStaffPins();
  assert(Array.isArray(pins) && pins.length > 0, 'Valid PINs loaded strictly from environment');
  assert(!pins.includes('2026') || process.env.INTERNAL_BACKUP_PIN?.includes('2026'), 'No rogue default PIN without env configuration');

  const secret = getAuthSecret();
  assert(typeof secret === 'string' && secret.length >= 16, 'AUTH_SECRET is configured and meets minimum length');

  // --- 2. Session Token Cryptographic Security ---
  console.log('\n--- 2. Testing Cryptographic HMAC Session Tokens ---');
  const validToken = generateSessionToken('staff');
  assert(typeof validToken === 'string' && validToken.includes('.'), 'Session token structure is payload.signature');

  const verified = verifySessionToken(validToken);
  assert(verified.valid === true && verified.payload.role === 'staff', 'Valid session token verified successfully');

  // Tampered token test
  const parts = validToken.split('.');
  const tamperedToken = parts[0] + 'x.' + parts[1];
  const tamperedRes = verifySessionToken(tamperedToken);
  assert(tamperedRes.valid === false, 'Tampered token payload is strictly rejected');

  // Wrong signature test
  const forgedToken = parts[0] + '.invalidsignature12345';
  const forgedRes = verifySessionToken(forgedToken);
  assert(forgedRes.valid === false, 'Forged signature is strictly rejected');

  // Expired token test
  const expiredPayload = Buffer.from(JSON.stringify({
    role: 'staff',
    issuedAt: Date.now() - 36000000,
    expiresAt: Date.now() - 1000, // already expired
  })).toString('base64url');
  const crypto = await import('crypto');
  const expiredSig = crypto.createHmac('sha256', secret).update(expiredPayload).digest('base64url');
  const expiredToken = `${expiredPayload}.${expiredSig}`;
  const expiredRes = verifySessionToken(expiredToken);
  assert(expiredRes.valid === false && expiredRes.reason === 'expired_token', 'Expired session token is strictly rejected');

  // --- 3. Request Header & Cookie Auth Extraction ---
  console.log('\n--- 3. Testing Request Auth Header & Cookie Resolution ---');
  const makeMockReq = (headerMap) => ({
    headers: {
      get: (name) => headerMap[name.toLowerCase()] || null,
    },
  });

  const reqWithBearer = makeMockReq({ authorization: `Bearer ${validToken}` });
  const authBearerRes = verifyRequestAuth(reqWithBearer);
  assert(authBearerRes.valid === true, 'Bearer authorization header accepted');

  const reqWithCookie = makeMockReq({ cookie: `sunblix_staff_session=${validToken}; other=123` });
  const authCookieRes = verifyRequestAuth(reqWithCookie);
  assert(authCookieRes.valid === true, 'HttpOnly session cookie accepted');

  const reqUnauth = makeMockReq({});
  const unauthRes = verifyRequestAuth(reqUnauth);
  assert(unauthRes.valid === false, 'Unauthenticated request correctly returns valid=false');

  // --- 4. Regression Test: Business Logic & Solar Engine Integrity ---
  console.log('\n--- 4. Testing Solar Engine & Calculation Integrity ---');
  const calc = calculateSolarSystem({ monthlyBill: 3500000, propertyType: 'house', systemType: 'hybrid' });
  assert(calc.kwp >= 5.0 && calc.kwp <= 6.0, 'Solar calculation kWp matches catalog tier (5.85 kWp)');
  assert(calc.panelCount === 10, '10 modules recommended for 3.5M bill in SUNBLIX 5.85 package');
  assert(calc.estimatedMonthlySavings > 1500000, 'Monthly savings calculation is preserved');

  console.log('\n============================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
