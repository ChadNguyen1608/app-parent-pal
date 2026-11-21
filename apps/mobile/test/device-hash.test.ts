import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';

import { DEVICE_HASH_SALT, deviceHash, sha256Hex } from '../src/data/device-hash.ts';

test('sha256 thuần khớp node:crypto (rỗng, ranh giới khối 55/56/64 byte, tiếng Việt, emoji, dài)', () => {
  for (const s of ['', 'abc', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(63), 'a'.repeat(64), 'a'.repeat(119), 'Tiếng Việt 😀 ñ', 'x'.repeat(5000)]) {
    assert.equal(sha256Hex(s), createHash('sha256').update(s, 'utf8').digest('hex'), `độ dài ${s.length}`);
  }
});

test('mã máy = sha256(androidId + muối cố định): 64 ký tự hex, tất định, khác nhau giữa các máy, không chứa Android ID', () => {
  const a = deviceHash('9774d56d682e549c');
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(a, createHash('sha256').update('9774d56d682e549c' + DEVICE_HASH_SALT).digest('hex'));
  assert.equal(a, deviceHash('9774d56d682e549c'));
  assert.notEqual(a, deviceHash('9774d56d682e549d'));
  assert.ok(!a.includes('9774d56d682e549c'));
  assert.notEqual(a, sha256Hex('9774d56d682e549c'), 'phải có muối');
});
