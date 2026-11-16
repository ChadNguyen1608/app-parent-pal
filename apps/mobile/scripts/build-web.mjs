// Xuất bản web của hai biến thể (dữ liệu giả) để test E2E và so ảnh. Dùng: node scripts/build-web.mjs [parent|child ...]
// Ra: .web-build/parent, .web-build/child (đã .gitignore). PHẢI --clear mỗi biến thể: cache Metro không phân biệt APP_VARIANT.
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const wanted = process.argv.slice(2);
const variants = wanted.length ? wanted : ['parent', 'child'];

for (const v of variants) {
  if (v !== 'parent' && v !== 'child') throw new Error(`Biến thể không hợp lệ: ${v}`);
  const out = join(root, '.web-build', v);
  rmSync(out, { recursive: true, force: true });
  console.log(`== build web: ${v}`);
  const r = spawnSync('npx', ['expo', 'export', '--platform', 'web', '--clear', '--output-dir', out], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, APP_VARIANT: v, EXPO_PUBLIC_API_MOCK: '1', CI: '1' },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
