// Màn đơn giản "Cần gói dùng thử / Premium" (D-68, D-72). Dùng khi máy chủ báo PLAN_REQUIRED hoặc app đã biết gói chưa đủ.
// Hộ còn dùng thử được (plan.trialAvailable) thì có nút "Dùng thử". Câu chữ tạm: xem src/data/plan.ts.
import { PLAN_CONTACT_NOTE, PLAN_RULES, planRequiredCopy } from '../data/plan';
import { useApp } from '../state/app';
import { Btn, H1, Notice, P, Screen } from './kit';
import { useAction } from './useAction';

export function PlanRequiredView({ rule, onBack }: { rule?: string | null; onBack: () => void }) {
  const { api, plan, refreshPlan } = useApp();
  const act = useAction();
  // Lời mời dùng thử chỉ khi hộ đang FREE và còn dùng thử được; không mời khi lý do là hết lượt sửa hoặc hết khóa (dùng thử không giúp được). Dùng thử có 1 khóa ghép máy (D-74).
  const offer = plan?.trialAvailable === true && plan.tier === 'FREE' && rule !== PLAN_RULES.keys && rule !== PLAN_RULES.trialEdit;
  const copy = planRequiredCopy(rule, offer ? plan?.trialDays : null);
  async function start() {
    const ok = await act.run(async () => {
      await api.trialStart();
      await refreshPlan().catch(() => undefined);
    });
    if (ok) onBack();
  }
  return (
    <Screen>
      <H1>{copy.title}</H1>
      <P>{copy.body}</P>
      {offer ? <Btn label={`Dùng thử ${plan?.trialDays} ngày`} onPress={start} busy={act.busy} /> : null}
      {act.error ? <Notice>{act.error}</Notice> : null}
      <Notice kind="info">{PLAN_CONTACT_NOTE}</Notice>
      <Btn label="Quay lại" kind="secondary" onPress={onBack} />
    </Screen>
  );
}
