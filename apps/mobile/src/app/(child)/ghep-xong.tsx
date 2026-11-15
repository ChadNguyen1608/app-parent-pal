import { useApp } from '@/state/app';
import { Btn, H1, P, Screen } from '@/ui/kit';

// CA-03 Ghép thành công.
export default function GhepXong() {
  const { acknowledgeJustPaired } = useApp();
  return (
    <Screen big>
      <H1>Đã kết nối</H1>
      <P big>Máy của con đã kết nối với gia đình.</P>
      <Btn big label="Tiếp tục" onPress={acknowledgeJustPaired} />
    </Screen>
  );
}
