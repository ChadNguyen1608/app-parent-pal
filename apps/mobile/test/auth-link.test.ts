import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseAuthLink } from '../src/data/auth-link.ts';
import { createMockApi, MOCK_LINK_CODE, MOCK_OTP } from '../src/data/mock.ts';

test('link PKCE: ?code=', () => {
  assert.deepEqual(parseAuthLink('parentbestpal-parent://auth-callback?code=abc-123'), { kind: 'code', code: 'abc-123' });
  assert.deepEqual(parseAuthLink('exp://192.168.1.5:8081/--/auth-callback?code=xyz'), { kind: 'code', code: 'xyz' });
});

test('link token_hash (mẫu thư tùy biến)', () => {
  assert.deepEqual(parseAuthLink('parentbestpal-parent://auth-callback?token_hash=pkce_h4sh&type=email'), {
    kind: 'token_hash', tokenHash: 'pkce_h4sh', type: 'email',
  });
  assert.equal(parseAuthLink('parentbestpal-parent://auth-callback?token_hash=h&type=recovery')?.kind, 'error');
});

test('link lỗi/hết hạn (query hoặc fragment)', () => {
  assert.deepEqual(
    parseAuthLink('parentbestpal-parent://auth-callback#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired'),
    { kind: 'error', errorCode: 'otp_expired' },
  );
  assert.equal(parseAuthLink('parentbestpal-parent://auth-callback?error=access_denied')?.kind, 'error');
  assert.deepEqual(parseAuthLink('parentbestpal-parent://auth-callback'), { kind: 'error', errorCode: null });
});

test('URL khác: bỏ qua', () => {
  assert.equal(parseAuthLink(null), null);
  assert.equal(parseAuthLink(''), null);
  assert.equal(parseAuthLink('parentbestpal-parent://gia-dinh?code=1'), null);
  assert.equal(parseAuthLink('https://example.com/not-auth-callback?code=1'), null);
});

test('mock: hoàn tất đăng nhập từ link', async () => {
  const api = createMockApi({ latencyMs: 0 });
  await api.auth.sendEmailOtp('a@b.vn', 'x://auth-callback');
  await assert.rejects(api.auth.completeFromLink({ kind: 'code', code: 'sai' }));
  const s = await api.auth.completeFromLink({ kind: 'code', code: MOCK_LINK_CODE });
  assert.equal(s.email, 'a@b.vn');
  assert.ok(MOCK_OTP);
});
