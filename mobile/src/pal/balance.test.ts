// So balance.ts với kết quả chạy hàm gốc trong prototype/index.html (fixtures/golden.json)
// trên 3 lịch mẫu. Tạo lại golden: node scripts/gen-golden.mjs. Chạy: npm test
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  actualDay,
  ageOf,
  checkDay,
  checkDayK,
  defaultBudget,
  fixedDay,
  getBudget,
  gradeOf,
  judge,
  rangeOf,
  relaxedCount,
  restRange,
} from './balance.ts';
import { DAYS, type PalState } from './types.ts';

const read = (f: string) => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
const fixtures: Record<string, PalState> = read('./fixtures/lich-mau.json');
const golden: Record<string, any> = read('./fixtures/golden.json');

for (const [name, state] of Object.entries(fixtures)) {
  const g = golden[name];
  test(`${name}: cảnh báo từng ngày`, () => {
    for (const d of DAYS) {
      assert.deepEqual(checkDayK(state, d), g.days[d].warn, `checkDayK ${d}`);
      assert.deepEqual(checkDay(state, d), g.days[d].checked, `checkDay ${d}`);
      assert.equal(relaxedCount(state, d), g.days[d].relaxed, `relaxedCount ${d}`);
    }
  });
  test(`${name}: giờ cố định và giờ thực từng ngày`, () => {
    for (const d of DAYS) {
      assert.deepEqual(fixedDay(state, d), g.days[d].fixed, `fixedDay ${d}`);
      assert.deepEqual(actualDay(state, d), g.days[d].actual, `actualDay ${d}`);
    }
  });
  test(`${name}: quỹ giờ`, () => {
    assert.deepEqual(getBudget(state), g.budget);
    assert.deepEqual(defaultBudget(state), g.defaultBudget);
    assert.deepEqual({ wd: restRange(state, 'wd'), we: restRange(state, 'we') }, g.rest);
    for (const col of ['wd', 'we'] as const) {
      assert.deepEqual(rangeOf(col, (d) => fixedDay(state, d), 'truong'), g.ranges[col].truong);
      assert.deepEqual(rangeOf(col, (d) => fixedDay(state, d), 'hoc_them'), g.ranges[col].hoc_them);
    }
  });
  test(`${name}: màu và câu cảnh báo của ô quỹ giờ`, () => {
    for (const [key, want] of Object.entries<any>(g.judged)) {
      const [col, gk, v] = key.split('.');
      assert.deepEqual(judge(state, gk, col as 'wd' | 'we', +v), want, key);
    }
  });
}

test('tuổi và lớp đọc từ hồ sơ', () => {
  const s = (t: string) => ({ profile: { tuoi_lop: t }, plan: { tong_quan: null, ngay: {}, ngoai_le: {} }, budget: null, activities: [] }) as PalState;
  assert.equal(gradeOf(s('8 tuổi, lớp 3')), 3);
  assert.equal(ageOf(s('lớp 8')), 13);
  assert.equal(gradeOf(s('')), null);
});
