// B-11: nhận diện khối bằng `kind` có cấu trúc thay cho regex trên tên khối (Business Logic 11.1 §2.2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scheduleWeek } from '../src/scheduler.ts';
import * as V from '../src/validators.ts';
import { PROFILES } from '../src/profiles.ts';
import { BLOCK_KINDS, DAYS } from '../../domain/src/index.ts';

const results = PROFILES.map((prof: any) => ({ prof, res: scheduleWeek(prof) }));
const ctxOf = (prof: any, plan: any, budget: any) => V.makeCtx({ plan, age: prof.age, grade: prof.grade, budget, activities: prof.activities });
const stripKinds = (plan: any) => { const p = JSON.parse(JSON.stringify(plan)); for (const d of DAYS) p.ngay[d].forEach((b: any) => { delete b.kind; }); return p; };
const mini = (blocks: any[]) => {
  const prof: any = PROFILES.find((p: any) => p.id === 'P3');
  const plan: any = { ngay: Object.fromEntries(DAYS.map((d) => [d, []])), ngoai_le: {} };
  plan.ngay.T2 = blocks.map((b) => ({ viec: [], xac_nhan: '', the_thao: false, man_hinh: false, trang_thai: 'binh_thuong', ghi_chu: '', ...b }));
  plan.ngay.T3 = [{ bat_dau: '06:00', ket_thuc: '06:30', khoi: 'x', kind: 'an_sang', tai: 'thap', nhom: 'sinh_hoat', viec: [] }];
  return ctxOf(prof, plan, scheduleWeek(prof).budget);
};

test('mọi khối do bộ xếp tạo ra đều có kind hợp lệ (8 hồ sơ)', () => {
  for (const { prof, res } of results) for (const d of DAYS) for (const b of res.plan.ngay[d]) {
    assert.ok(b.kind, `${prof.id} ${d} "${b.khoi}" thiếu kind`);
    assert.ok((BLOCK_KINDS as readonly string[]).includes(b.kind), `${prof.id} ${d} "${b.khoi}" kind lạ: ${b.kind}`);
  }
});

test('bộ kiểm cho cùng kết quả dù đọc kind hay suy từ tên (lịch cũ không có kind), 8 hồ sơ', () => {
  for (const { prof, res } of results) {
    const a = ctxOf(prof, res.plan, res.budget), b = ctxOf(prof, stripKinds(res.plan), res.budget);
    for (const d of DAYS) {
      const meta = { tradeoffs: res.tradeoffs };
      assert.deepEqual(V.checkDayK(b, d), V.checkDayK(a, d), `${prof.id} ${d} checkDayK`);
      assert.deepEqual(V.extraChecks(b, d, meta), V.extraChecks(a, d, meta), `${prof.id} ${d} extra`);
      assert.deepEqual(V.actualDay(b, d), V.actualDay(a, d), `${prof.id} ${d} actualDay`);
    }
  }
});

test('tên khối tùy ý: "Karate" kind hoat_dong the_thao kết thúc 30′ trước tắt đèn → tap_muon', () => {
  const ctx = mini([
    { bat_dau: '06:00', ket_thuc: '07:00', khoi: 'Sáng', kind: 'an_sang', tai: 'thap', nhom: 'sinh_hoat' },
    { bat_dau: '19:00', ket_thuc: '20:00', khoi: 'Karate', kind: 'hoat_dong', tai: 'cao', nhom: 'hoc_them', the_thao: true },
    { bat_dau: '20:30', ket_thuc: '20:30', khoi: 'Ngủ', kind: 'tat_den', tai: 'phuc_hoi', nhom: 'ngu' },
  ]);
  assert.ok(V.checkDayK(ctx, 'T2').some((w: any) => w.k === 'tap_muon'));
});

test('tên khối tùy ý: "Xyz" kind hoc_nha được tính là giờ học; "Ôn bài" kind choi_tu_do thì không', () => {
  const blocks = (kind: string, khoi: string) => mini([
    { bat_dau: '06:00', ket_thuc: '06:30', khoi: 'Sáng', kind: 'an_sang', tai: 'thap', nhom: 'sinh_hoat' },
    { bat_dau: '18:00', ket_thuc: '19:50', khoi, kind, tai: 'vua', nhom: 'hoc_nha' },
    { bat_dau: '21:00', ket_thuc: '21:00', khoi: 'Ngủ', kind: 'tat_den', tai: 'phuc_hoi', nhom: 'ngu' },
  ]);
  assert.ok(V.checkDayK(blocks('hoc_nha', 'Xyz'), 'T2').some((w: any) => w.k === 'tong_gio_hoc'));
  assert.ok(!V.checkDayK(blocks('choi_tu_do', 'Ôn bài'), 'T2').some((w: any) => w.k === 'tong_gio_hoc'));
});

test('tên có chữ "không" (khớp /ôn/ ở regex cũ) với kind choi_tu_do không bị coi là học', () => {
  const ctx = mini([
    { bat_dau: '06:00', ket_thuc: '06:30', khoi: 'Sáng', kind: 'an_sang', tai: 'thap', nhom: 'sinh_hoat' },
    { bat_dau: '17:00', ket_thuc: '19:00', khoi: 'Chơi không màn hình', kind: 'choi_tu_do', tai: 'vua', nhom: 'choi_nghi' },
    { bat_dau: '21:00', ket_thuc: '21:00', khoi: 'Ngủ', kind: 'tat_den', tai: 'phuc_hoi', nhom: 'ngu' },
  ]);
  assert.equal(V.isStudy(V.liveBlocks(ctx, 'T2')[1]), false);
});

test('nhập lịch cũ không có kind: suy kind từ tên (đường duy nhất còn dùng regex)', () => {
  assert.equal(V.inferLegacyKind({ khoi: 'Tắt đèn, ngủ' }, 0), 'tat_den');
  assert.equal(V.inferLegacyKind({ khoi: 'Ôn bài', tai: 'vua' }, 30), 'hoc_nha');
  assert.equal(V.inferLegacyKind({ khoi: 'Ăn tối cùng gia đình' }, 30), 'an_toi');
  assert.equal(V.inferLegacyKind({ khoi: 'Học ở trường' }, 240), 'truong');
});
