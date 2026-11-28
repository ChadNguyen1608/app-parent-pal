import { useLocalSearchParams, useRouter } from 'expo-router';

import { PlanRequiredView } from '@/ui/PlanRequired';

// Màn "Cần gói dùng thử / Premium" (D-68). rule: mã quy tắc máy chủ báo (D-68.free, D-68.trial_plan, D-68.trial_edit, D-68.premium).
export default function CanGoi() {
  const router = useRouter();
  const { rule } = useLocalSearchParams<{ rule?: string }>();
  return <PlanRequiredView rule={rule ?? null} onBack={() => (router.canGoBack() ? router.back() : router.replace('/(parent)/(tabs)/gia-dinh'))} />;
}
