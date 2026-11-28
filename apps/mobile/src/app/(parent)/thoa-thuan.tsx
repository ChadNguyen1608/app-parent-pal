import { View } from 'react-native';

import {
  GHI_CHU_TUYEN_BO,
  THOA_THUAN_DOI_PHIEN_BAN,
  THOA_THUAN_GHI_CHU_KHONG_DONG_Y,
  THOA_THUAN_MO_DAU,
  THOA_THUAN_NUT_DONG_Y,
  THOA_THUAN_NUT_KHONG_DONG_Y,
  THOA_THUAN_TIEU_DE,
  TUYEN_BO_QUYEN_RIENG_TU,
} from '@/content/dieu-khoan';
import { useApp } from '@/state/app';
import { DieuKhoanBox } from '@/ui/DieuKhoanBox';
import { Btn, H1, Note, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// Thỏa thuận người dùng (D-76): hiện ngay sau đăng nhập lần đầu, trước bước tạo gia đình; hiện lại một lần khi Điều khoản đổi phiên bản.
// Nội dung dùng lại PA-32 (tuyên bố quyền lưu dữ liệu + khung cuộn Điều khoản). Bấm "Đồng ý" ghi lên máy chủ (ai, phiên bản, lúc nào) rồi cổng ở
// _layout mở bước tiếp theo. Không đồng ý thì không đi tiếp: chỉ có lối đăng xuất. PA-32 trong tab Gia đình vẫn để xem lại.
export default function ThoaThuan() {
  const { terms, acceptTerms, signOut } = useApp();
  const accept = useAction();
  const out = useAction();
  // Bấm Đồng ý mà máy chủ báo bản đã đổi (VALIDATION): app đã đọc lại phiên bản, màn báo "Điều khoản vừa được cập nhật" thay vì lỗi chung.
  const changed = accept.failure?.code === 'VALIDATION';
  return (
    <Screen>
      <H1>{THOA_THUAN_TIEU_DE}</H1>
      <P>{changed ? THOA_THUAN_DOI_PHIEN_BAN : THOA_THUAN_MO_DAU}</P>
      <P>{TUYEN_BO_QUYEN_RIENG_TU}</P>
      <Note>{GHI_CHU_TUYEN_BO}</Note>
      <DieuKhoanBox />
      {accept.error && !changed ? <Notice>{accept.error}</Notice> : null}
      <Btn label={THOA_THUAN_NUT_DONG_Y} onPress={() => void accept.run(acceptTerms)} busy={accept.busy} />
      <View style={{ gap: 6 }}>
        <Note>{THOA_THUAN_GHI_CHU_KHONG_DONG_Y}</Note>
        {out.error ? <Notice>{out.error}</Notice> : null}
        <Btn label={THOA_THUAN_NUT_KHONG_DONG_Y} kind="secondary" onPress={() => void out.run(signOut)} busy={out.busy} />
      </View>
    </Screen>
  );
}
