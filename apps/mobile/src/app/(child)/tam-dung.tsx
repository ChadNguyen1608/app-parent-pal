import { useRouter } from 'expo-router';

import { CHILD_PAUSED_BODY, CHILD_PAUSED_TITLE } from '@/data/plan';
import { useApp } from '@/state/app';
import { Btn, H1, P, Screen } from '@/ui/kit';

// CA-18 Tạm dừng. Hai lý do:
//  - Gói không còn hoạt động (D-72, D-74: hết dùng thử, hạ gói, máy vượt số khóa ghép): không hiện lịch, không nhận lịch mới. Câu chữ tạm, chờ chủ sản phẩm duyệt.
//  - Gia đình đóng băng: câu chữ nguyên từ wireframe; con xem lại lịch đã có được.
export default function TamDung() {
  const router = useRouter();
  const { childPlanActive, dismissPause } = useApp();
  if (!childPlanActive) {
    return (
      <Screen big>
        <H1>{CHILD_PAUSED_TITLE}</H1>
        <P big>{CHILD_PAUSED_BODY}</P>
      </Screen>
    );
  }
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
