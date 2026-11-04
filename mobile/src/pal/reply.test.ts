// Test phần app xung quanh Pal: áp phản hồi vào lịch, ghép prompt, đọc JSON của mô hình.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { blank } from './appstate.ts';
import { parseReply, PalError } from './client.ts';
import { mockReply } from './mock.ts';
import { buildPrompt, stateForPrompt } from './prompt.ts';
import { OUTPUT_FORMAT } from './prompt.generated.ts';
import { applyReply } from './reply.ts';
import { DAYS } from './types.ts';

const TODAY = '2026-11-04';
const say = (s: ReturnType<typeof blank>, text: string) => {
  s.messages.push({ role: 'user', content: text });
  return applyReply(s, mockReply(text, s), TODAY, 1);
};

test('ví dụ lớp 3: ghi hồ sơ, tổng quan, hoạt động, lịch cả tuần', () => {
  const s = blank();
  const r = say(s, 'Con mình 8 tuổi, học lớp 3');
  assert.equal(s.profile.tuoi_lop, '8 tuổi, lớp 3');
  assert.equal(s.activities.length, 1);
  assert.equal(s.activities[0].nguon, 'pal');
  assert.deepEqual(s.actNew, [s.activities[0].id]);
  assert.ok(s.plan.tong_quan?.muc_tieu?.length);
  for (const d of DAYS) assert.ok((s.plan.ngay[d] || []).length > 0, d);
  assert.equal(r.tools, 1 + 1 + 1 + 7);
  assert.equal(r.warn, '', 'lịch cân bằng thì không có cảnh báo');
  assert.equal(s.actDirty, false);
});

test('ví dụ lớp 8: cảnh báo cân bằng của app được ghép vào', () => {
  const s = blank();
  const r = say(s, 'Con mình 13 tuổi, học lớp 8');
  assert.match(r.warn, /Con ngủ muộn/);
  assert.match(r.warn, /Thứ Hai:/);
  assert.ok(r.warn.split('\n').length <= 5);
});

test('hủy ngày ốm chỉ áp dụng tuần này, lịch mẫu giữ nguyên', () => {
  const s = blank();
  say(s, 'lớp 3');
  const mau = JSON.stringify(s.plan.ngay.T5);
  say(s, 'Thứ Năm tuần này con bị ốm, hủy toàn bộ lịch');
  assert.equal(JSON.stringify(s.plan.ngay.T5), mau);
  assert.ok(s.plan.ngoai_le.T5!.khoi.every((x) => x.trang_thai === 'huy'));
  assert.equal(s.plan.ngoai_le.T5!.ly_do, 'Con bị ốm');
  assert.ok(s.changed.T5!.length > 0);
});

test('giai đoạn tạm thời được tạo và đang áp dụng', () => {
  const s = blank();
  say(s, 'lớp 3');
  say(s, 'Con thi ngày 28/11, ôn thi');
  assert.equal(s.plan.giai_doan?.trang_thai, 'dang_ap_dung');
  assert.deepEqual(s.plan.giai_doan?.noi_long, ['tong_gio_hoc']);
  assert.ok(s.plan.giai_doan?.lich_goc);
});

test('sửa hoạt động giữ id và đánh dấu Pal vừa ghi', () => {
  const s = blank();
  say(s, 'lớp 3');
  const id = s.activities[0].id;
  say(s, 'Lớp tiếng Anh chuyển từ thứ Tư sang thứ Năm');
  assert.equal(s.activities.length, 1);
  assert.equal(s.activities[0].id, id);
  assert.deepEqual(s.activities[0].thu, ['T5', 'T6']);
  assert.deepEqual(s.actNew, [id]);
});

test('chỉ trò chuyện: không đổi lịch', () => {
  const s = blank();
  const r = say(s, 'Xin chào');
  assert.equal(r.tools, 0);
  assert.equal(s.plan.tong_quan, null);
});

test('prompt chứa định dạng trả lời, trạng thái hợp lệ và hội thoại', () => {
  const s = blank();
  say(s, 'lớp 3');
  const p = buildPrompt(s, new Date(2026, 10, 4));
  assert.ok(p.includes(OUTPUT_FORMAT));
  assert.ok(p.includes('Phụ huynh: lớp 3'));
  const st = JSON.parse(stateForPrompt(s, new Date(2026, 10, 4)));
  assert.match(st.hom_nay, /^2026-11-04 \(Thứ Tư\)/);
  assert.equal(st.hoat_dong.length, 1);
  assert.equal(st.quy_thoi_gian.xe_dich_toi_da, 30);
});

test('parseReply chịu được code fence và chữ thừa, báo lỗi rõ khi hỏng', () => {
  assert.equal(parseReply('```json\n{"tra_loi":"a"}\n```').tra_loi, 'a');
  assert.equal(parseReply('Đây là kết quả: {"tra_loi":"b"} xong').tra_loi, 'b');
  assert.throws(() => parseReply('không có json'), PalError);
  assert.throws(() => parseReply('{"tra_loi": '), PalError);
  assert.throws(() => parseReply('[1,2]'), PalError);
});
