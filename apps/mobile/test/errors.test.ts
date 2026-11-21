import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ApiError, FALLBACK_MESSAGES, apiErrorFromFailure, formatWait, pinWrongMessage, toApiError } from '../src/data/errors.ts';

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

test('ghép máy: mã sai nằm trong payload ok=false, thành NOT_FOUND chung (không lộ mã có tồn tại không)', () => {
  const e = apiErrorFromFailure({ ok: false, error: { code: 'NOT_FOUND', rule: 'BR-FAM-031', message_vi: 'Mã không đúng hoặc đã hết hạn.' } }, 0);
  assert.equal(e.code, 'NOT_FOUND');
  assert.equal(e.rule, 'BR-FAM-031');
  assert.equal(e.userMessage, 'Mã không đúng hoặc đã hết hạn.');
  // Mã lạ hoặc thiếu lời Việt: không lộ chuỗi tiếng Anh/kỹ thuật.
  const odd = apiErrorFromFailure({ ok: false, error: { code: 'WHATEVER', message_vi: 'bad' } }, 0);
  assert.equal(odd.code, 'UNKNOWN');
  assert.equal(odd.userMessage, FALLBACK_MESSAGES.UNKNOWN);
  assert.equal(apiErrorFromFailure(null, 0).code, 'UNKNOWN');
});

test('RATE_LIMITED (PT429) và CONFLICT_REV là mã backend', () => {
  const r = toApiError({ message: 'RATE_LIMITED', details: 'BR-FAM-031', hint: 'Đã thử quá nhiều lần. Hãy thử lại sau ít phút.', code: 'PT429' });
  assert.equal(r.code, 'RATE_LIMITED');
  assert.equal(r.userMessage, 'Đã thử quá nhiều lần. Hãy thử lại sau ít phút.');
  assert.equal(toApiError({ code: 'PT429', message: 'x' }).code, 'RATE_LIMITED');
  assert.equal(toApiError({ message: 'RATE_LIMITED' }).userMessage, FALLBACK_MESSAGES.RATE_LIMITED);
  const c = toApiError({ message: 'CONFLICT_REV', details: 'FR01-T09', hint: 'Liên kết đã thay đổi. Hãy tải lại.', code: 'PT409' });
  assert.equal(c.code, 'CONFLICT_REV');
  assert.equal(c.rule, 'FR01-T09');
});

test('PIN sai (ok=false, FR01-T02): lời tiếng Việt nói còn mấy lần thử hoặc bao lâu nữa mở khóa', () => {
  const fail = (extra: object) => ({ ok: false, error: { code: 'FORBIDDEN', rule: 'FR01-T02', message_vi: 'PIN chưa đúng.', ...extra } });
  const a = apiErrorFromFailure(fail({ attempts_left: 3, locked_until: null }), 0);
  assert.equal(a.code, 'FORBIDDEN');
  assert.equal(a.attemptsLeft, 3);
  assert.equal(a.lockedUntil, null);
  assert.equal(a.userMessage, 'PIN chưa đúng. Bạn còn 3 lần thử.');
  assert.match(apiErrorFromFailure(fail({ attempts_left: 1, locked_until: null }), 0).userMessage, /còn 1 lần thử/);
  const now = Date.parse('2026-11-16T00:00:00Z');
  const locked = apiErrorFromFailure(fail({ attempts_left: 0, locked_until: '2026-11-16T00:15:00Z' }), now);
  assert.equal(locked.lockedUntil, '2026-11-16T00:15:00Z');
  assert.match(locked.userMessage, /tạm khóa/);
  assert.match(locked.userMessage, /khoảng 15 phút/);
  assert.match(pinWrongMessage(0, '2026-11-16T01:30:00Z', now), /1 giờ 30 phút/);
  assert.match(pinWrongMessage(0, '2026-11-16T00:00:20Z', now), /1 phút/, 'làm tròn lên, không hẹn sớm');
  assert.equal(pinWrongMessage(null, null, now), 'PIN chưa đúng. Bạn thử lại nhé.');
  assert.equal(formatWait(-5), 'ít giây');
  for (const m of [a.userMessage, locked.userMessage]) assert.ok(!/[A-Z_]{6,}/.test(m), 'không lộ mã kỹ thuật');
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
  assert.equal(toApiError({ code: 'over_email_send_rate_limit', message: 'x' }).code, 'RATE_LIMITED');
  assert.equal(toApiError({ code: 'email_address_invalid', message: 'x' }).code, 'EMAIL_INVALID');
  assert.equal(toApiError({ code: 'anonymous_provider_disabled', message: 'x' }).code, 'AUTH_DISABLED');
  assert.equal(toApiError({ name: 'AuthSessionMissingError', message: 'x' }).code, 'UNAUTHENTICATED');
  assert.equal(toApiError({ status: 429, message: 'x' }).code, 'RATE_LIMITED');
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

test('PLAN_REQUIRED (D-68): mã máy chủ, lời tiếng Việt của máy chủ, HTTP 402 / PT402, ok=false', () => {
  const a = toApiError({ message: 'PLAN_REQUIRED', details: 'D-68.premium', hint: 'Chỉ gói Premium mới ghép và đồng bộ lịch sang máy của con.', code: 'PT402' });
  assert.equal(a.code, 'PLAN_REQUIRED');
  assert.equal(a.rule, 'D-68.premium');
  assert.equal(a.userMessage, 'Chỉ gói Premium mới ghép và đồng bộ lịch sang máy của con.');
  assert.equal(toApiError({ message: 'PLAN_REQUIRED', hint: 'plan required' }).userMessage, FALLBACK_MESSAGES.PLAN_REQUIRED, 'hint không có dấu thì dùng câu dự phòng');
  assert.equal(toApiError({ code: 'PT402', message: 'x' }).code, 'PLAN_REQUIRED');
  assert.equal(toApiError({ status: 402, message: 'x' }).code, 'PLAN_REQUIRED');
  assert.equal(apiErrorFromFailure({ ok: false, error: { code: 'PLAN_REQUIRED', rule: 'D-68.free', message_vi: 'Cần gói dùng thử hoặc Premium.' } }, 0).code, 'PLAN_REQUIRED');
});

test('TRIAL_USED (409, D-72): lấy lời tiếng Việt của máy chủ; thiếu lời thì dùng câu dự phòng, không lộ mã', () => {
  const e = toApiError({ message: 'TRIAL_USED', details: 'D-72.claim', hint: 'Máy này hoặc email này đã dùng thử rồi.', code: 'PT409' });
  assert.equal(e.code, 'TRIAL_USED');
  assert.equal(e.rule, 'D-72.claim');
  assert.equal(e.userMessage, 'Máy này hoặc email này đã dùng thử rồi.');
  const f = toApiError({ message: 'TRIAL_USED', details: 'D-72.household', code: 'PT409' });
  assert.equal(f.code, 'TRIAL_USED');
  assert.match(f.userMessage, /đã dùng thử/);
  assert.ok(!/TRIAL_USED|D-72/.test(f.userMessage));
});
