import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CHILD_PAUSED_BODY, PLAN_RULES, canPair, childPlanLine, planLines, planRequiredCopy, tierLabel } from '../src/data/plan.ts';
import type { PlanInfo } from '../src/data/types.ts';

const base: PlanInfo = {
  tier: 'TRIAL', expired: false, plansMax: 1, editsMax: 3, children: [{ childId: 'c1', plansUsed: 0, editsUsed: 0, editsLeft: 3 }],
  palQuestionsLeft: null, trialEndsAt: null, trialAvailable: false, trialDays: 7,
};

test('chỉ PREMIUM ghép máy; chưa biết gói (null) thì app không tự khóa', () => {
  assert.equal(canPair({ ...base, tier: 'PREMIUM', plansMax: null, editsMax: null }), true);
  assert.equal(canPair(base), false);
  assert.equal(canPair({ ...base, tier: 'FREE' }), false);
  assert.equal(canPair(null), false);
});

test('nhãn và dòng mô tả theo gói (D-72: theo con); TRIAL quá hạn nói rõ đã hết hạn', () => {
  assert.equal(tierLabel(base), 'Dùng thử');
  assert.equal(tierLabel({ ...base, tier: 'PREMIUM' }), 'Premium');
  assert.equal(tierLabel({ ...base, tier: 'FREE' }), 'Miễn phí');
  assert.equal(tierLabel({ ...base, tier: 'FREE', expired: true }), 'Dùng thử (đã hết hạn)');
  assert.match(planLines(base)[0], /Mỗi con tạo được 1 kế hoạch và chỉnh sửa 3 lần\./);
  assert.match(planLines({ ...base, tier: 'FREE', expired: true })[0], /hết hạn/);
  assert.match(planLines({ ...base, tier: 'FREE' })[0], /Nhập thông tin con và hỏi Pal được; chưa xem trước và tạo lịch/);
  assert.match(planLines({ ...base, tier: 'PREMIUM' }).join(' '), /không giới hạn/);
});

test('dòng mức dùng của từng con chỉ có ở gói TRIAL; con lạ thì không có dòng', () => {
  assert.equal(childPlanLine(base, 'c1'), 'Chưa tạo kế hoạch (tạo được 1 kế hoạch).');
  const used: PlanInfo = { ...base, children: [{ childId: 'c1', plansUsed: 1, editsUsed: 2, editsLeft: 1 }] };
  assert.equal(childPlanLine(used, 'c1'), 'Đã tạo kế hoạch. Còn 1 lần chỉnh sửa.');
  assert.equal(childPlanLine(base, 'khac'), null);
  assert.equal(childPlanLine({ ...base, tier: 'FREE' }, 'c1'), null);
  assert.equal(childPlanLine({ ...base, tier: 'PREMIUM' }, 'c1'), null);
  assert.equal(childPlanLine(null, 'c1'), null);
});

test('màn "Cần gói": mỗi quy tắc máy chủ có tiêu đề riêng, mã lạ thì câu chung; không lộ mã kỹ thuật', () => {
  const titles = new Set(Object.values(PLAN_RULES).map((r) => planRequiredCopy(r).title));
  assert.equal(titles.size, 3, 'ba quy tắc, ba tiêu đề');
  assert.equal(planRequiredCopy(PLAN_RULES.free).title, planRequiredCopy('khong-biet').title);
  assert.equal(planRequiredCopy(null).title, planRequiredCopy(undefined).title);
  for (const r of [...Object.values(PLAN_RULES), null]) {
    const c = planRequiredCopy(r, 7);
    assert.ok(!/D-68|D-72|PLAN_REQUIRED/.test(c.title + c.body));
  }
});

test('màn "Cần gói" lý do miễn phí: nói được và không được gì; chỉ nhắc số ngày dùng thử khi còn dùng thử được', () => {
  const free = planRequiredCopy(PLAN_RULES.free, 7);
  assert.match(free.body, /nhập thông tin con và hỏi Pal/);
  assert.match(free.body, /chưa xem trước và tạo lịch/);
  assert.match(free.body, /dùng thử 7 ngày/);
  assert.doesNotMatch(planRequiredCopy(PLAN_RULES.free, null).body, /dùng thử \d/);
  assert.doesNotMatch(planRequiredCopy(PLAN_RULES.free).body, /dùng thử \d/);
  assert.match(planRequiredCopy(PLAN_RULES.trialEdit).body, /mỗi con 3 lần/);
});

test('máy con tạm dừng: câu chờ bố mẹ cập nhật', () => {
  assert.match(CHILD_PAUSED_BODY, /Tạm dừng, chờ bố mẹ cập nhật/);
});
