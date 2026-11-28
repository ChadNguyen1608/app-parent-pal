import { useRouter } from 'expo-router';
import { GHI_CHU_TUYEN_BO, TUYEN_BO_QUYEN_RIENG_TU } from '@/content/dieu-khoan';
import { DieuKhoanBox } from '@/ui/DieuKhoanBox';
import { Btn, H1, Note, P, Screen } from '@/ui/kit';

// PA-32 Quyền riêng tư (D-73; D-76: vẫn để xem lại sau khi đã đồng ý ở màn thỏa thuận lúc đăng ký): tuyên bố áp chung cho mọi con (không chia theo con), nút "Đồng ý", rồi khung cuộn "Điều khoản sử dụng".
// Không còn công tắc đồng ý ở đây: đồng ý lõi và hai mục riêng đã ghi mặc định khi tạo con; công tắc và xóa dữ liệu nằm ở Cài đặt dữ liệu.
// "Đồng ý" chỉ xác nhận đã đọc và quay lại (sử dụng app đồng nghĩa đồng ý, theo chính câu tuyên bố); không ghi gì lên máy chủ.
// Câu tuyên bố là nguyên văn D-73, kèm ghi chú "câu chữ chờ duyệt". Điều khoản là bản nháp của AI, chờ luật sư.
export default function QuyenRieng() {
  const router = useRouter();
  return (
    <Screen>
      <H1>Quyền riêng tư</H1>
      <P>{TUYEN_BO_QUYEN_RIENG_TU}</P>
      <Note>{GHI_CHU_TUYEN_BO}</Note>
      <Btn label="Đồng ý" onPress={() => router.back()} />
      <DieuKhoanBox />
    </Screen>
  );
}
