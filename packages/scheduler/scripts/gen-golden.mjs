#!/usr/bin/env node
// Sinh fixtures/golden từ spike v2 (T0.3). Chỉ chạy khi cần sinh lại; test không gọi file này.
// Dùng: node packages/scheduler/scripts/gen-golden.mjs <thư-mục-spike-e1-scheduler>
// Đọc out/P1..P8.json (kết quả đã chạy của spike), đối chiếu với kết quả chạy lại mã spike, rồi ghi
// fixtures/golden/P1..P8.json (giờ + tên khối + tải + nhóm + màn hình, trạng thái ngày) và fixtures/golden/params.json.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const spike = process.argv[2];
if (!spike) { console.error('Thiếu đường dẫn spike-e1-scheduler'); process.exit(2); }
const require = createRequire(join(spike, 'src', 'x.js'));
const { scheduleWeek } = require(join(spike, 'src', 'scheduler.js'));
const { validatePhase } = require(join(spike, 'src', 'phase.js'));
const PROFILES = require(join(spike, 'src', 'profiles.js'));
const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'fixtures', 'golden');
mkdirSync(outDir, { recursive: true });

const slim = (b) => ({ bat_dau: b.bat_dau, ket_thuc: b.ket_thuc, khoi: b.khoi, tai: b.tai, nhom: b.nhom, man_hinh: b.man_hinh });
for (const prof of PROFILES) {
  const fromOut = JSON.parse(readFileSync(join(spike, 'out', prof.id + '.json'), 'utf8'));
  let phase = null;
  if (prof.phase) { const v = validatePhase(prof.phase, prof.phaseHistory || []); phase = v.status === 'OK' ? prof.phase : null; }
  const live = scheduleWeek(Object.assign({}, prof, { phase }));
  // out/ đã lưu và chạy lại phải trùng nhau từng chữ
  assert.deepEqual(JSON.parse(JSON.stringify(live.plan)), fromOut.plan, prof.id + ': out/ lệch chạy lại');
  const days = {};
  for (const d of Object.keys(live.plan.ngay)) days[d] = live.plan.ngay[d].map(slim);
  const golden = {
    id: prof.id, label: prof.label,
    day_status: Object.fromEntries(Object.entries(live.days).map(([d, x]) => [d, x.status])),
    n_tradeoffs: live.tradeoffs.length, n_questions: live.questions.length, days,
  };
  writeFileSync(join(outDir, prof.id + '.json'), JSON.stringify(golden, null, 1) + '\n');
}
const params = JSON.parse(readFileSync(join(spike, 'out', 'params.json'), 'utf8'));
writeFileSync(join(outDir, 'params.json'), JSON.stringify(params, null, 1) + '\n');
console.log('Đã ghi golden P1..P8 + params.json vào', outDir);
