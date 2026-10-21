/**
 * ============================================================================
 * SUNBLIX SURTI AI — ACCEPTANCE TEST SUITE
 * ============================================================================
 * Automated verification of:
 * 1. Deterministic Solar Calculation Engine
 * 2. SPH State Machine & Human Approval Enforcement
 * 3. 4-Layer Memory Persistence & Retrieval
 * 4. Knowledge Base & Product Retrieval
 */

import { calculateSolarSystem, formatRupiah } from './solarEngine.js';
import {
  createDraftSph,
  submitSphForReview,
  approveSphByHuman,
  issueOfficialSph,
  getSphById,
} from './sphService.js';
import {
  getOrCreateCustomerMemory,
  updateSemanticFact,
  retrieveRelevantMemories,
  clearCustomerMemory,
} from './memorySystem.js';
import { searchKnowledge } from './knowledgeBase.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

console.log('\n============================================================');
console.log('🧪 RUNNING SURTI AI TEST SUITE');
console.log('============================================================\n');

// TEST 1: Deterministic Solar Calculation
console.log('--- 1. Testing Deterministic Solar Calculation Engine ---');
const calc1 = calculateSolarSystem({
  monthlyBill: 2500000,
  propertyType: 'house',
  systemType: 'hybrid',
});

assert(calc1.kwp === 4.68, 'Monthly bill 2.5jt house should size to 4.68 kWp package');
assert(calc1.panelCount === 8, '4.68 kWp system must have exactly 8 panels (585Wp)');
assert(calc1.estimatedMonthlySavings > 0, 'Estimated monthly savings must be greater than 0');
assert(calc1.paybackPeriodYears > 0 && calc1.paybackPeriodYears <= 10, 'Payback period must be between 0 and 10 years');
assert(calc1.environmentalImpact.monthlyCo2AvoidedKg > 0, 'CO2 reduction must be positive');

// TEST 2: SPH Workflow & Human Approval Enforcement
console.log('\n--- 2. Testing SPH Workflow & Mandatory Human Approval ---');
const draft = createDraftSph({
  customerId: 'test-cust-99',
  customerName: 'Bapak Testing',
  monthlyBill: 5000000,
  propertyType: 'house',
  systemType: 'hybrid',
});

assert(draft.status === 'draft', 'Newly created SPH must strictly be in "draft" status');
assert(draft.sphNumber.includes('/SUNBLIX-SPH/'), 'SPH number must follow official format');

// Mandatory rule check: SPH cannot be issued directly from draft
let issueErrorCaught = false;
try {
  issueOfficialSph(draft.id, 'Illegal Issuer');
} catch (e) {
  issueErrorCaught = true;
}
assert(issueErrorCaught, 'Mandatory rule verified: SPH CANNOT be issued without human approval!');

// Submit review & human approve
submitSphForReview(draft.id, 'Diajukan untuk review');
const submitted = getSphById(draft.id);
assert(submitted.status === 'pending_review', 'SPH status updated to "pending_review"');

approveSphByHuman(draft.id, 'Ir. Sutanto (Senior Engineer)', 'Disetujui');
const approved = getSphById(draft.id);
assert(approved.status === 'approved', 'SPH status updated to "approved" after human review');

const issued = issueOfficialSph(draft.id, 'Direktur Komersial');
assert(issued.status === 'issued', 'SPH successfully issued after human approval');

// TEST 3: 4-Layer Memory Persistence
console.log('\n--- 3. Testing 4-Layer Persistent Memory System ---');
const testCustId = 'memory-test-user-01';
clearCustomerMemory(testCustId);

const mem = getOrCreateCustomerMemory(testCustId);
assert(mem.workingMemory.activeIntent === 'greeting', 'Working memory initialized with greeting intent');

updateSemanticFact(testCustId, 'monthlyBill', 4500000, true);
updateSemanticFact(testCustId, 'propertyType', 'villa', true);

const retrieved = retrieveRelevantMemories(testCustId);
assert(retrieved.semantic.monthlyBill === 4500000, 'Semantic memory persisted monthlyBill fact across turns');
assert(retrieved.semantic.propertyType === 'villa', 'Semantic memory persisted propertyType fact');

// TEST 4: Official Knowledge Base Retrieval
console.log('\n--- 4. Testing Official Knowledge Base Retrieval ---');
const kb1 = searchKnowledge('astronergy');
assert(kb1.length > 0 && kb1[0].title.includes('Astronergy'), 'Search for "astronergy" retrieves panel knowledge');

const kb2 = searchKnowledge('hybrid');
assert(kb2.length > 0 && kb2[0].summary.includes('baterai'), 'Search for "hybrid" retrieves battery knowledge');

console.log('\n============================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
