import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TIMEZONE, TZ_OFFSET_MINUTES, addDays, dateInVietnam, dayCodeOf, dayNumber, isIsoDate, isoFromDayNumber, weekStart, toMin, hhmm } from '../src/index.ts';

test('múi giờ cố định Asia/Ho_Chi_Minh, UTC+7', () => {
  assert.equal(TIMEZONE, 'Asia/Ho_Chi_Minh');
  assert.equal(TZ_OFFSET_MINUTES, 420);
});

test('dayCodeOf: mốc đã biết (2026-11-15 là Chủ nhật)', () => {
  assert.equal(dayCodeOf('2026-11-15'), 'CN');
  assert.equal(dayCodeOf('2026-11-16'), 'T2');
  assert.equal(dayCodeOf('2027-01-01'), 'T6');
  assert.equal(dayCodeOf('1970-01-01'), 'T5');
  assert.equal(dayCodeOf('1969-12-31'), 'T4');
});

test('weekStart trả về thứ Hai của tuần chứa ngày', () => {
  assert.equal(weekStart('2026-11-15'), '2026-11-09');
  assert.equal(weekStart('2026-11-16'), '2026-11-16');
  assert.equal(weekStart('2026-11-22'), '2026-11-16');
});

test('addDays qua tháng, năm, năm nhuận', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2027-03-01', -1), '2027-02-28');
  assert.equal(isoFromDayNumber(dayNumber('2026-11-15')), '2026-11-15');
});

test('dateInVietnam: mốc truyền vào, không đọc đồng hồ; 17:30 UTC đã là ngày hôm sau ở Việt Nam', () => {
  assert.equal(dateInVietnam(Date.UTC(2026, 10, 15, 16, 59, 59)), '2026-11-15');
  assert.equal(dateInVietnam(Date.UTC(2026, 10, 15, 17, 0, 0)), '2026-11-16');
  assert.equal(dateInVietnam(Date.UTC(2026, 10, 15, 23, 59, 0)), '2026-11-16');
});

test('isIsoDate từ chối ngày không có thật', () => {
  assert.equal(isIsoDate('2027-02-29'), false);
  assert.equal(isIsoDate('2028-02-29'), true);
  assert.equal(isIsoDate('2027-1-5'), false);
  assert.equal(isIsoDate(20270105), false);
});

test('toMin / hhmm', () => {
  assert.equal(toMin('07:30'), 450);
  assert.equal(toMin('xx'), null);
  assert.equal(hhmm(450), '07:30');
  assert.equal(hhmm(-30), '23:30');
  assert.equal(hhmm(1500), '01:00');
});
