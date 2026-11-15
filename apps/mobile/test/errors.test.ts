import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ApiError, FALLBACK_MESSAGES, toApiError } from '../src/data/errors.ts';

test('lỗi backend: dùng hint tiếng Việt, giữ mã và quy tắc', () => {
  const e = toApiError({ message: 'FROZEN', details: 'BR-FAM-FROZEN', hint: 'Gia đình đang tạm dừng app.', code: 'PT423' });
  assert.equal(e.code, 'FROZEN');
  assert.equal(e.rule, 'BR-FAM-FROZEN');
  assert.equal(e.userMessage, 'Gia đình đang tạm dừng app.');
});

test('hint rỗng hoặc tiếng Anh: dùng câu dự phòng theo mã', () => {
  assert.equal(toApiError({ message: 'FORBIDDEN', hint: '' }).userMessage, FALLBACK_MESSAGES.FORBIDDEN);
  assert.equal(toApiError({ message: 'VALIDATION', hint: 'bad input' }).userMessage, FALLBACK_MESSAGES.VALIDATION);
  for (const c of ['UNAUTHENTICATED', 'FORBIDDEN', 'FROZEN', 'VALIDATION', 'NOT_FOUND'] as const) {
    const e = toApiError({ message: c });
    assert.equal(e.code, c);
    assert.match(e.userMessage, /[a-zA-Zà-ỹ]/);
    assert.ok(!/[A-Z_]{6,}/.test(e.userMessage), 'không lộ mã kỹ thuật cho người dùng');
  }
});

test('ghép máy: NOT_FOUND và VALIDATION thành một câu chung (không lộ mã có tồn tại không)', () => {
  const a = toApiError({ message: 'NOT_FOUND', hint: 'Mã này đã dùng rồi.' }, 'pair');
  const b = toApiError({ message: 'VALIDATION', hint: 'Mã hết hạn từ 10:03.' }, 'pair');
  assert.equal(a.userMessage, 'Mã không đúng hoặc đã hết hạn.');
  assert.equal(b.userMessage, a.userMessage);
  assert.equal(toApiError({ message: 'FROZEN', hint: 'Gia đình đang tạm dừng app.' }, 'pair').code, 'FROZEN');
});

test('PIN sai: FORBIDDEN trong ngữ cảnh pin thành "PIN chưa đúng"', () => {
  assert.equal(toApiError({ message: 'FORBIDDEN', hint: 'Không có quyền.' }, 'pin').userMessage, 'PIN chưa đúng. Bạn thử lại nhé.');
  assert.equal(toApiError({ message: 'FROZEN' }, 'pin').code, 'FROZEN');
});

test('lỗi quyền Postgres 42501 thành FORBIDDEN', () => {
  assert.equal(toApiError({ code: '42501', message: 'permission denied for function pair_accept' }).code, 'FORBIDDEN');
});

test('lỗi mạng', () => {
  assert.equal(toApiError(new TypeError('Network request failed')).code, 'NETWORK');
  assert.equal(toApiError({ name: 'AuthRetryableFetchError', message: 'x' }).code, 'NETWORK');
});

test('lỗi Supabase Auth', () => {
  assert.equal(toApiError({ code: 'otp_expired', message: 'Token has expired or is invalid' }).code, 'OTP_INVALID');
  assert.equal(toApiError({ code: 'over_email_send_rate_limit', message: 'x' }).code, 'RATE_LIMIT');
  assert.equal(toApiError({ code: 'email_address_invalid', message: 'x' }).code, 'EMAIL_INVALID');
  assert.equal(toApiError({ code: 'anonymous_provider_disabled', message: 'x' }).code, 'AUTH_DISABLED');
  assert.equal(toApiError({ name: 'AuthSessionMissingError', message: 'x' }).code, 'UNAUTHENTICATED');
  assert.equal(toApiError({ status: 429, message: 'x' }).code, 'RATE_LIMIT');
});

test('không rõ: câu chung, không lộ nguyên văn lỗi tiếng Anh', () => {
  const e = toApiError(new Error('relation "app.foo" does not exist'));
  assert.equal(e.code, 'UNKNOWN');
  assert.ok(!e.userMessage.includes('relation'));
  assert.equal(toApiError(null).code, 'UNKNOWN');
  assert.equal(toApiError(undefined).code, 'UNKNOWN');
});

test('ApiError đi qua nguyên vẹn', () => {
  const orig = new ApiError('LOCKED', 'x');
  assert.equal(toApiError(orig), orig);
});
