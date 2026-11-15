// T0.4: múi giờ cố định Asia/Ho_Chi_Minh; không hàm nào đọc đồng hồ máy; kết quả không đổi theo TZ của tiến trình.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { TIMEZONE } from '../../domain/src/index.ts';

test('múi giờ sản phẩm là Asia/Ho_Chi_Minh', () => assert.equal(TIMEZONE, 'Asia/Ho_Chi_Minh'));

// Cấm API đọc đồng hồ hoặc phụ thuộc múi giờ máy trong mã nguồn. new Date(<số>).toISOString() (UTC) vẫn được dùng.
const FORBIDDEN = [
  /Date\.now\s*\(/, /new Date\s*\(\s*\)/, /process\.hrtime/, /performance\.now/, /Intl\.DateTimeFormat/,
  /toLocale\w*String/, /getTimezoneOffset/, /\.get(FullYear|Month|Date|Day|Hours|Minutes|Seconds)\s*\(/, /process\.env\.TZ/,
];
test('mã nguồn scheduler và domain không đọc đồng hồ máy, không dùng API theo múi giờ máy', () => {
  for (const pkg of ['scheduler', 'domain']) {
    const dir = new URL(`../../${pkg}/src/`, import.meta.url);
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
      const code = readFileSync(new URL(f, dir), 'utf8').replace(/\/\/.*$/gm, '');
      for (const re of FORBIDDEN) assert.doesNotMatch(code, re, `${pkg}/src/${f} chứa ${re}`);
    }
  }
});

const probe = fileURLToPath(new URL('./tz-probe.ts', import.meta.url));
const hashIn = (tz: string) =>
  execFileSync(process.execPath, ['--experimental-strip-types', '--no-warnings', probe], { env: { PATH: process.env.PATH ?? '', TZ: tz }, encoding: 'utf8' }).trim();

test('cùng đầu ra khi TZ=UTC, Asia/Ho_Chi_Minh, America/Los_Angeles, Pacific/Kiritimati (UTC+14)', () => {
  const zones = ['UTC', 'Asia/Ho_Chi_Minh', 'America/Los_Angeles', 'Pacific/Kiritimati'];
  const hashes = zones.map(hashIn);
  assert.match(hashes[0], /^[0-9a-f]{64}$/);
  hashes.forEach((h, i) => assert.equal(h, hashes[0], `TZ=${zones[i]} khác TZ=${zones[0]}`));
});
