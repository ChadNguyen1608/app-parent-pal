import { CHILD_PAUSED_BODY, CHILD_PAUSED_TITLE } from '@/data/plan';
import { Center, H1, P } from '@/ui/kit';

// CA-18 Tạm dừng, dùng khi hộ không còn PREMIUM (D-72). Câu chữ tạm, chờ chủ sản phẩm duyệt.
// Nút "Con cần giúp đỡ" vẫn ở thanh trên (layout). Không hiện lịch, không nhận lịch mới.
export default function TamDung() {
  return (
    <Center>
      <H1>{CHILD_PAUSED_TITLE}</H1>
      <P>{CHILD_PAUSED_BODY}</P>
    </Center>
  );
}
