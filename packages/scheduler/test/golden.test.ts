// Golden: đầu ra scheduleWeek của 8 hồ sơ khớp spike v2 (out/P1..P8.json) về giờ và tên khối (Tech Spec 13.1 §6.1).
// Fixture sinh bằng scripts/gen-golden.mjs từ chính mã spike. Khác biệt duy nhất so với spike là trường mới `kind` (B-11),
// không nằm trong so sánh; `ghi_chu` không so sánh vì spike v2 chỉ đổi ghi chú so với v1 (CHANGES §3).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { scheduleWeek, PARAMS } from '../src/scheduler.ts';
import { validatePhase } from '../src/phase.ts';
import { PROFILES } from '../src/profiles.ts';

const fx = (n: string) => JSON.parse(readFileSync(new URL(`../fixtures/golden/${n}.json`, import.meta.url), 'utf8'));
const slim = (b: any) => ({ bat_dau: b.bat_dau, ket_thuc: b.ket_thuc, khoi: b.khoi, tai: b.tai, nhom: b.nhom, man_hinh: b.man_hinh });

function runProfile(prof: any) {
  // như run.js: giai đoạn chỉ áp khi validatePhase = OK
  let phase = null;
  if (prof.phase) phase = validatePhase(prof.phase, prof.phaseHistory || []).status === 'OK' ? prof.phase : null;
  return scheduleWeek({ ...prof, phase });
}

for (const prof of PROFILES) {
  test(`golden ${prof.id}: giờ và tên khối khớp spike`, () => {
    const g = fx(prof.id);
    const res = runProfile(prof);
    assert.deepEqual(Object.keys(res.plan.ngay), Object.keys(g.days));
    for (const d of Object.keys(g.days)) {
      assert.deepEqual(res.plan.ngay[d].map(slim), g.days[d], `${prof.id} ${d}`);
    }
  });
  test(`golden ${prof.id}: trạng thái ngày, số đánh đổi, số câu hỏi`, () => {
    const g = fx(prof.id);
    const res = runProfile(prof);
    assert.deepEqual(Object.fromEntries(Object.entries(res.days).map(([d, x]: any) => [d, x.status])), g.day_status);
    assert.equal(res.tradeoffs.length, g.n_tradeoffs);
    assert.equal(res.questions.length, g.n_questions);
  });
}

test('golden: 8 hồ sơ P1..P8', () => {
  assert.deepEqual(PROFILES.map((p: any) => p.id), ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']);
});

test('golden: PARAMS khớp out/params.json (id, giá trị, nhãn D-08)', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(PARAMS)), fx('params'));
});

test('golden: tất định, đầu ra đầy đủ giống hệt khi chạy lại (gồm ghi chú, đánh đổi)', () => {
  for (const prof of PROFILES) assert.equal(JSON.stringify(runProfile(prof)), JSON.stringify(runProfile(prof)), prof.id);
});
