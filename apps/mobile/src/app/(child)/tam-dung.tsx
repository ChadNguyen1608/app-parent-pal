import { useRouter } from 'expo-router';

import { useApp } from '@/state/app';
import { Btn, H1, P, Screen } from '@/ui/kit';

// CA-18 Tạm dừng (gia đình đóng băng). Câu chữ nguyên từ wireframe. Nút "Con cần giúp đỡ" nằm ở thanh trên (CA-14 vẫn dùng được).
export default function TamDung() {
  const router = useRouter();
  const { dismissPause } = useApp();
  return (
    <Screen big>
      <H1>Gia đình đang tạm dừng app.</H1>
      <P big>Con vẫn xem được lịch đã có. Con nhờ bố mẹ mở app nhé.</P>
      <Btn
        big
        kind="secondary"
        label="Xem lịch đã có"
        onPress={() => {
          dismissPause();
          router.replace('/(child)/(tabs)/hom-nay');
        }}
      />
    </Screen>
  );
}
