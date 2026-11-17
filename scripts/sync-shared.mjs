#!/usr/bin/env node
// T0.5 (Dev Plan 15.1; Tech Spec 13.1 §5; Architecture 12.1 §7.3, AD-03, R-02).
// Chép mã TS thuần của bộ xếp lịch vào cây Edge Function (Deno chỉ nạp mã nằm trong supabase/functions/).
//   packages/scheduler/src  ->  backend/supabase/functions/_shared/scheduler/src
//   packages/domain/src     ->  backend/supabase/functions/_shared/domain/src
// Giữ nguyên cấu trúc thư mục để import tương đối `../../domain/src/index.ts` của bộ xếp vẫn đúng.
// Mỗi file chép được thêm một dòng tiêu đề "SINH TỰ ĐỘNG"; thêm `_shared/scheduler/version.ts` (ENGINE_VERSION = băm nguồn)
// và `_shared/SYNC.json` (băm từng file nguồn).
//   node scripts/sync-shared.mjs           ghi/cập nhật
//   node scripts/sync-shared.mjs --check   không ghi; mã thoát 1 nếu cây đích lệch nguồn (CI)
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEST_ROOT = join(ROOT, 'backend/supabase/functions/_shared');
const MAPS = [
  { from: 'packages/scheduler/src', to: 'scheduler/src' },
  { from: 'packages/domain/src', to: 'domain/src' },
];
const check = process.argv.includes('--check');

const sha = (s) => createHash('sha256').update(s).digest('hex');
const walk = (dir) => readdirSync(dir).sort().flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const header = (src) => `// SINH TỰ ĐỘNG bởi scripts/sync-shared.mjs từ ${src}. KHÔNG SỬA TAY: sửa ở packages/ rồi chạy lại script.\n`;

/** Cây đích mong đợi: Map<đường dẫn tương đối với _shared, nội dung>. */
function expectedTree() {
  const files = new Map();
  const manifest = {};
  for (const { from, to } of MAPS) {
    const base = join(ROOT, from);
    for (const f of walk(base)) {
      const rel = relative(base, f).split(sep).join('/');
      if (!rel.endsWith('.ts')) continue;   // .gitkeep và file khác không phải mã
      const body = readFileSync(f, 'utf8');
      const src = `${from}/${rel}`;
      files.set(`${to}/${rel}`, header(src) + body);
      manifest[src] = sha(body);
    }
  }
  const engineHash = sha(Object.keys(manifest).sort().map((k) => `${k}:${manifest[k]}`).join('\n'));
  files.set('scheduler/version.ts',
    `// SINH TỰ ĐỘNG bởi scripts/sync-shared.mjs. ENGINE_VERSION = băm toàn bộ nguồn bộ xếp và domain: đổi mã thì đổi số.\n` +
    `export const ENGINE_VERSION = 'e1-${engineHash.slice(0, 12)}';\n`);
  files.set('SYNC.json', JSON.stringify({ _doc: 'SINH TỰ ĐỘNG bởi scripts/sync-shared.mjs. Băm sha256 từng file nguồn.', engine_hash: engineHash, sources: manifest }, null, 2) + '\n');
  return files;
}

const want = expectedTree();
const diffs = [];

// Các thư mục đích do script quản: mọi file thừa trong đó cũng là lệch.
const owned = ['scheduler', 'domain'];
const present = new Set();
for (const d of owned) {
  const dir = join(DEST_ROOT, d);
  if (existsSync(dir)) for (const f of walk(dir)) present.add(relative(DEST_ROOT, f).split(sep).join('/'));
}
if (existsSync(join(DEST_ROOT, 'SYNC.json'))) present.add('SYNC.json');

for (const [rel, content] of want) {
  const p = join(DEST_ROOT, rel);
  if (!existsSync(p)) diffs.push(`thiếu: ${rel}`);
  else if (readFileSync(p, 'utf8') !== content) diffs.push(`lệch: ${rel}`);
}
for (const rel of present) if (!want.has(rel)) diffs.push(`thừa: ${rel}`);

if (check) {
  if (diffs.length) {
    console.error('Cây _shared lệch so với packages/ (chạy `node scripts/sync-shared.mjs`):');
    for (const d of diffs) console.error('  ' + d);
    process.exit(1);
  }
  console.log(`sync-shared: khớp (${want.size} file).`);
} else {
  for (const rel of present) if (!want.has(rel)) rmSync(join(DEST_ROOT, rel));
  for (const [rel, content] of want) {
    const p = join(DEST_ROOT, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
  }
  console.log(`sync-shared: đã ghi ${want.size} file (${diffs.length} thay đổi).`);
}
