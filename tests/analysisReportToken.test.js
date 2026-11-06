import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalysisReportToken, readAnalysisReportToken } from '../lib/engineering/analysisReportToken.js';

test('round-trips report data without exposing it in the token', () => {
  process.env.AUTH_SECRET = 'test-secret-at-least-32-characters-long';
  const data = { customerName: 'Leni', city: 'Tasikmalaya', summary: { kwp: 5.12 } };
  const token = createAnalysisReportToken(data, { now: 1_800_000_000_000 });
  assert.equal(token.includes('Leni'), false);
  assert.deepEqual(readAnalysisReportToken(token, { now: 1_800_000_000_100 }), data);
});

test('rejects expired report tokens', () => {
  process.env.AUTH_SECRET = 'test-secret-at-least-32-characters-long';
  const token = createAnalysisReportToken({ customerName: 'Leni' }, { now: 1_800_000_000_000, ttlSeconds: 1 });
  assert.equal(readAnalysisReportToken(token, { now: 1_800_000_002_000 }), null);
});

test('rejects modified report tokens', () => {
  process.env.AUTH_SECRET = 'test-secret-at-least-32-characters-long';
  const token = createAnalysisReportToken({ customerName: 'Leni' }, { now: 1_800_000_000_000 });
  const altered = `${token.slice(0, -1)}${token.endsWith('A') ? 'B' : 'A'}`;
  assert.equal(readAnalysisReportToken(altered, { now: 1_800_000_000_100 }), null);
});
