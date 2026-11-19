// Màn đơn giản "Cần gói dùng thử / Premium" (D-68). Dùng khi máy chủ báo PLAN_REQUIRED hoặc app đã biết gói chưa đủ.
// Câu chữ tạm: xem src/data/plan.ts.
import { PLAN_CONTACT_NOTE, planRequiredCopy } from '../data/plan';
import { Btn, H1, Notice, P, Screen } from './kit';

export function PlanRequiredView({ rule, onBack }: { rule?: string | null; onBack: () => void }) {
  const copy = planRequiredCopy(rule);
  return (
    <Screen>
      <H1>{copy.title}</H1>
      <P>{copy.body}</P>
      <Notice kind="info">{PLAN_CONTACT_NOTE}</Notice>
      <Btn label="Quay lại" kind="secondary" onPress={onBack} />
    </Screen>
  );
}
