import { useRouter } from 'expo-router';

import { useApp } from '@/state/app';
import { Btn, H1, P, Screen } from '@/ui/kit';

// CA-16 Những gì bố mẹ thấy (tối thiểu). Câu chữ bám IA 4.6 / D-03, CHỜ chủ sản phẩm duyệt.
// Danh sách phải khớp quyền thật; cập nhật khi tính năng thật được bật.
const LINES = [
  'Bố mẹ thấy lịch của con.',
  'Bố mẹ thấy khi con bấm "Xong" và giờ con bấm.',
  'Bố mẹ thấy con hay mệt vào ngày nào, trong báo cáo cuối tuần. Bố mẹ không thấy con chọn gì từng ngày.',
  'Bố mẹ thấy mong muốn và đề xuất con gửi.',
  'Bố mẹ không thấy khi con bấm "Con cần giúp đỡ".',
];

export default function BoMeThay() {
  const router = useRouter();
  const { childStage, acknowledgeIntro } = useApp();
  return (
    <Screen big>
      <H1>Những gì bố mẹ thấy</H1>
      {LINES.map((l) => (
        <P key={l} big>
          {l}
        </P>
      ))}
      <Btn
        big
        label="Con hiểu rồi"
        onPress={() => {
          if (childStage === 'intro') {
            // Guard của bo-me-thay vẫn mở khi đã 'ready' nên phải tự chuyển sang màn chính.
            void acknowledgeIntro().then(() => router.replace('/(child)/(tabs)/hom-nay'));
          } else router.back();
        }}
      />
    </Screen>
  );
}
