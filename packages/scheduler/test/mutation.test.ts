// Thử đột biến (port mutation-test.js): làm hỏng có chủ đích một lịch hợp lệ, mỗi lỗi phải bị bộ kiểm bắt.
// Khối thêm vào mang `kind` có cấu trúc (B-11); khối cũ bị bỏ/sửa chọn theo `kind`, không theo tên.
// Spike: 11/12 (bỏ lọt tap_muon khi buổi tập kết thúc sau giờ tắt đèn). Ở đây đạt 12/12 sau khi sửa B-11c.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scheduleWeek } from '../src/scheduler.ts';
import * as V from '../src/validators.ts';
import { PROFILES } from '../src/profiles.ts';

const prof = PROFILES.find((p) => p.id === 'P3');
const base = scheduleWeek(prof);
const clone = () => JSON.parse(JSON.stringify(base.plan));
const tm = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3);
const put = (p: any, ...bs: any[]) => {
  for (const b of bs) {
    p.ngay.T2 = p.ngay.T2.filter((x: any) => x.bat_dau === x.ket_thuc || tm(x.ket_thuc) <= tm(b.bat_dau) || tm(x.bat_dau) >= tm(b.ket_thuc));
    p.ngay.T2.push({ viec: [], xac_nhan: 'Con bấm Xong', the_thao: false, man_hinh: false, trang_thai: 'binh_thuong', ghi_chu: '', ...b });
  }
};
const run = (plan: any, d: string) => {
  const ctx = V.makeCtx({ plan, age: prof.age, grade: prof.grade, budget: base.budget, activities: prof.activities });
  return [...V.checkDayK(ctx, d).map((w: any) => w.k), ...V.extraChecks(ctx, d, { tradeoffs: [] }).map((w: any) => w.k)];
};
const without = (p: any, f: (b: any) => boolean) => { p.ngay.T2 = p.ngay.T2.filter((b: any) => !f(b)); };

const M: [string, string, (p: any) => void][] = [
  ['bỏ khối phục hồi → phuc_hoi', 'phuc_hoi', (p) => without(p, (b) => b.kind === 'phuc_hoi' || b.kind === 'choi_tu_do' || b.kind === 'nghi_ngan')],
  ['học trước giờ đi học → truoc_gio_hoc', 'truoc_gio_hoc', (p) => put(p, { bat_dau: '06:20', ket_thuc: '06:40', khoi: 'Ôn bài sáng', kind: 'hoc_nha', tai: 'vua', nhom: 'hoc_nha' })],
  ['hai khối cao liền → cao_lien', 'cao_lien', (p) => put(p, { bat_dau: '19:00', ket_thuc: '19:30', khoi: 'Ôn bài khó', kind: 'hoc_nha', tai: 'cao', nhom: 'hoc_nha' }, { bat_dau: '19:30', ket_thuc: '19:50', khoi: 'Làm đề toán', kind: 'hoc_nha', tai: 'cao', nhom: 'hoc_nha' })],
  ['tắt đèn muộn → ngu', 'ngu', (p) => { p.ngay.T2.find((b: any) => b.kind === 'tat_den').bat_dau = '23:00'; }],
  ['bỏ bữa phụ ở trường → an_xa', 'an_xa', (p) => without(p, (b) => b.kind === 'bua_phu' || b.kind === 'phuc_hoi')],
  ['học vượt quỹ → tong_gio_hoc', 'tong_gio_hoc', (p) => put(p, { bat_dau: '19:00', ket_thuc: '20:00', khoi: 'Ôn bài thêm', kind: 'hoc_nha', tai: 'vua', nhom: 'hoc_nha' })],
  ['tập mạnh sát giờ ngủ → tap_muon', 'tap_muon', (p) => put(p, { bat_dau: '19:10', ket_thuc: '19:50', khoi: 'Tập bóng', kind: 'hoat_dong', tai: 'cao', nhom: 'hoc_them', the_thao: true })],
  ['tập mạnh KẾT THÚC SAU giờ tắt đèn → tap_muon (B-11c)', 'tap_muon', (p) => { { const bed = p.ngay.T2.find((b: any) => b.kind === 'tat_den'); bed.bat_dau = bed.ket_thuc = '19:30'; } put(p, { bat_dau: '19:10', ket_thuc: '19:50', khoi: 'Tập bóng', kind: 'hoat_dong', tai: 'cao', nhom: 'hoc_them', the_thao: true }); }],
  ['màn hình sát giờ ngủ → x_man_hinh_ngu', 'x_man_hinh_ngu', (p) => put(p, { bat_dau: '19:30', ket_thuc: '19:50', khoi: 'Xem tivi', kind: 'man_hinh', tai: 'thap', man_hinh: true })],
  ['phiên học quá dài → x_phien', 'x_phien', (p) => put(p, { bat_dau: '19:00', ket_thuc: '20:00', khoi: 'Ôn bài dài', kind: 'hoc_nha', tai: 'vua', nhom: 'hoc_nha' })],
  ['bỏ ăn tối → x_bo_bua', 'x_bo_bua', (p) => without(p, (b) => b.kind === 'an_toi')],
  ['B-1: hai phiên học cách 4′ → x_nghi_giua (sàn 5′)', 'x_nghi_giua', (p) => put(p, { bat_dau: '19:00', ket_thuc: '19:20', khoi: 'Ôn bài phần 1', kind: 'hoc_nha', tai: 'vua', nhom: 'hoc_nha' }, { bat_dau: '19:24', ket_thuc: '19:40', khoi: 'Ôn bài phần 2', kind: 'hoc_nha', tai: 'vua', nhom: 'hoc_nha' })],
];

test('mutation: lịch gốc P3 T2 không có lỗi nào', () => assert.deepEqual(run(base.plan, 'T2'), []));
for (const [name, key, f] of M) {
  test(`mutation: ${name}`, () => {
    const p = clone();
    f(p);
    const ks = run(p, 'T2');
    assert.ok(ks.includes(key), `không bắt được ${key}; bắt được ${JSON.stringify([...new Set(ks)])}`);
  });
}
test('mutation: 12/12', () => assert.equal(M.length, 12));
