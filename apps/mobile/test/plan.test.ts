import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PLAN_RULES, canPair, planLines, planRequiredCopy, tierLabel } from '../src/data/plan.ts';
import type { PlanInfo } from '../src/data/types.ts';

const base: PlanInfo = { tier: 'TRIAL', expired: false, plansUsed: 0, plansMax: 1, editsUsed: 0, editsLeft: 3, palQuestionsLeft: null, trialEndsAt: null };

test('chỉ PREMIUM ghép máy; chưa biết gói (null) thì app không tự khóa', () => {
  assert.equal(canPair({ ...base, tier: 'PREMIUM', plansMax: null, editsLeft: null }), true);
  assert.equal(canPair(base), false);
  assert.equal(canPair({ ...base, tier: 'FREE' }), false);
  assert.equal(canPair(null), false);
});

test('nhãn và dòng mô tả theo gói; TRIAL quá hạn nói rõ đã hết hạn', () => {
  assert.equal(tierLabel(base), 'Dùng thử');
  assert.equal(tierLabel({ ...base, tier: 'PREMIUM' }), 'Premium');
  assert.equal(tierLabel({ ...base, tier: 'FREE' }), 'Miễn phí');
  assert.equal(tierLabel({ ...base, tier: 'FREE', expired: true }), 'Dùng thử (đã hết hạn)');
  assert.match(planLines(base)[0], /Đã tạo 0\/1 kế hoạch\. Còn 3 lần chỉnh sửa\./);
  assert.match(planLines({ ...base, plansUsed: 1, editsLeft: 0 })[0], /Đã tạo 1\/1 kế hoạch\. Còn 0 lần/);
  assert.match(planLines({ ...base, tier: 'FREE', expired: true })[0], /hết hạn/);
  assert.match(planLines({ ...base, tier: 'FREE' })[0], /Chưa tạo được kế hoạch/);
  assert.match(planLines({ ...base, tier: 'PREMIUM' }).join(' '), /không giới hạn/);
});

test('màn "Cần gói": mỗi quy tắc máy chủ có tiêu đề riêng, mã lạ thì câu chung; không lộ mã kỹ thuật', () => {
  const titles = new Set(Object.values(PLAN_RULES).map((r) => planRequiredCopy(r).title));
  assert.equal(titles.size, 4, 'bốn quy tắc, bốn tiêu đề');
  assert.equal(planRequiredCopy(PLAN_RULES.free).title, planRequiredCopy('khong-biet').title);
  assert.equal(planRequiredCopy(null).title, planRequiredCopy(undefined).title);
  for (const r of [...Object.values(PLAN_RULES), null]) {
    const c = planRequiredCopy(r);
    assert.ok(!/D-68|PLAN_REQUIRED/.test(c.title + c.body));
  }
});
