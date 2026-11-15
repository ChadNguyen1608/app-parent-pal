import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveBackend } from '../src/config.ts';
import { checkCallName, checkEmail, checkOtp, checkPairCode, checkPin, parseGrade } from '../src/data/validate.ts';
import { uuidv4 } from '../src/data/uuid.ts';

test('email và OTP', () => {
  assert.ok(checkEmail(''));
  assert.ok(checkEmail('abc'));
  assert.equal(checkEmail(' me@example.com '), null);
  assert.equal(checkOtp('123456'), null);
  assert.ok(checkOtp('12345'));
  assert.ok(checkOtp('12a456'));
});

test('tên gọi, lớp, PIN, mã ghép', () => {
  assert.ok(checkCallName('  '));
  assert.ok(checkCallName('x'.repeat(41)));
  assert.equal(checkCallName('Bống'), null);
  assert.deepEqual(parseGrade(''), { grade: null, error: null });
  assert.equal(parseGrade('5').grade, 5);
  assert.ok(parseGrade('0').error);
  assert.ok(parseGrade('10').error);
  assert.ok(parseGrade('a').error);
  assert.equal(checkPin('123456', '123456'), null);
  assert.ok(checkPin('1234'));
  assert.ok(checkPin('123456', '654321'));
  assert.equal(checkPairCode('123456'), null);
  assert.ok(checkPairCode('12'));
});

test('chọn backend theo biến môi trường', () => {
  assert.equal(resolveBackend({}), 'missing');
  assert.equal(resolveBackend({ EXPO_PUBLIC_SUPABASE_URL: 'u' }), 'missing');
  assert.equal(resolveBackend({ EXPO_PUBLIC_SUPABASE_URL: 'u', EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'k' }), 'supabase');
  assert.equal(resolveBackend({ EXPO_PUBLIC_API_MOCK: '1' }), 'mock');
  assert.equal(resolveBackend({ EXPO_PUBLIC_API_MOCK: '1', EXPO_PUBLIC_SUPABASE_URL: 'u', EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'k' }), 'mock');
});

test('uuidv4 đúng dạng', () => {
  assert.match(uuidv4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
