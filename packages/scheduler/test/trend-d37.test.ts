// D-37: xu hướng mệt theo loại ngày, không theo thứ, không ngày; hiện từ 1 lần (BR-NTF-059).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trendByDayType, dayTypesOfDate, dayTypesOfBlocks } from '../src/fatigue.ts';
import { scheduleWeek } from '../src/scheduler.ts';
import { PROFILES } from '../src/profiles.ts';

const p4 = PROFILES.find((p: any) => p.id === 'P4'); // Toán T3, T5 tối 18:00; bóng đá T6 17:00
const plan = scheduleWeek(p4).plan;
// 2027-01-05 là thứ Ba, 2027-01-07 thứ Năm, 2027-01-08 thứ Sáu, 2027-01-06 thứ Tư
const typesOf = (d: string) => dayTypesOfDate(plan, d);

test('loại ngày đọc từ kind của khối: ngày học thêm tối / thể thao / không hoạt động', () => {
  assert.deepEqual(typesOf('2027-01-05'), ['hoc_them_toi', 'co_hoc_them']);
  assert.deepEqual(typesOf('2027-01-08'), ['co_the_thao']);
  assert.deepEqual(typesOf('2027-01-06'), ['khong_hoat_dong']);
  assert.ok(typesOf('2027-01-09').includes('khong_di_hoc') || typesOf('2027-01-09').includes('khong_hoat_dong'));
});

test('gộp theo loại ngày: hai ngày thứ khác nhau cùng loại → cộng chung; kết quả không có thứ, không có ngày', () => {
  const recs = [
    { choice: 'rat_met', date: '2027-01-05', day: 'T3', text: 'abc-xyz-secret' },
    { choice: 'rat_met', date: '2027-01-07', day: 'T5' },
    { choice: 'hoi_met', date: '2027-01-06', day: 'T4' },
  ];
  const tr = trendByDayType(recs, '2027-01-10', typesOf);
  assert.equal(tr.count, 2);
  assert.equal(tr.by_day_type.hoc_them_toi, 2);
  assert.equal(tr.by_day_type.khong_hoat_dong, undefined);
  const json = JSON.stringify(tr);
  assert.doesNotMatch(json, /"T3"|"T5"|2027-01-0|abc-xyz-secret|by_day"/);
});

test('hiện từ 1 lần, không có ngưỡng (D-37, D-21)', () => {
  const one = trendByDayType([{ choice: 'rat_met', date: '2027-01-05' }], '2027-01-10', typesOf);
  assert.equal(one.show_in_weekly_report, true);
  assert.equal(one.status, 'HIEN_TRONG_BAO_CAO_TUAN');
  const none = trendByDayType([{ choice: 'on', date: '2027-01-05' }], '2027-01-10', typesOf);
  assert.equal(none.show_in_weekly_report, false);
  assert.equal(none.status, 'KHONG_CO');
});

test('cửa sổ 14 ngày tính cả hai đầu; today là tham số', () => {
  const r = (date: string) => ({ choice: 'rat_met', date });
  const tr = trendByDayType([r('2026-12-28'), r('2026-12-27'), r('2027-01-10'), r('2027-01-11')], '2027-01-10', typesOf);
  assert.equal(tr.count, 2); // 12-28 là ngày đầu của cửa sổ 14 ngày kết thúc 01-10; 12-27 ra ngoài; 01-11 ở tương lai
});

test('ngoại lệ của một ngày đè lên lịch tuần khi tính loại ngày', () => {
  const p = JSON.parse(JSON.stringify(plan));
  p.ngoai_le['2027-01-05'] = { khoi: [] };
  assert.deepEqual(dayTypesOfDate(p, '2027-01-05'), ['khong_di_hoc', 'khong_hoat_dong']);
  assert.deepEqual(dayTypesOfBlocks([]), ['khong_di_hoc', 'khong_hoat_dong']);
});
