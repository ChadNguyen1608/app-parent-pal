import { useApp } from '@/state/app';
import { Btn, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// PA-39 Tài khoản tạm khóa (hộ đóng băng). Câu chữ lấy nguyên từ wireframe. Chỉ QL có nút mở lại (máy chủ cũng kiểm).
// Người lớn khác: thấy dòng "nhắc người quản lý chính" (tạm). Không hiện dữ liệu con, không có đường vào PA-35, PA-24
// (wireframe không vẽ; máy chủ mặc định chặn xóa khi đóng băng).
export default function TamKhoa() {
  const { api, home, refreshHome } = useApp();
  const act = useAction();
  const kids = home?.children ?? [];
  const who = kids.length === 1 ? `Máy của ${kids[0].callName}` : kids.length > 1 ? 'Máy của các con' : 'Máy của con';
  return (
    <Screen big>
      <H1>Tài khoản gia đình đang tạm khóa</H1>
      <P muted>
        Đã 30 ngày không có người lớn nào mở app. {who} chỉ còn xem lịch đã có, không nhận lịch mới. Dữ liệu vẫn được giữ nguyên.
      </P>
      {act.error ? <Notice>{act.error}</Notice> : null}
      {home?.role === 'PRIMARY' ? (
        <>
          <Btn label="Mở lại tài khoản" busy={act.busy} onPress={() => void act.run(async () => { await api.householdReopen(true); await refreshHome(); })} />
          <P muted>Chỉ người quản lý chính mở lại được.</P>
        </>
      ) : (
        <P muted>Chỉ người quản lý chính mở lại được. Bạn nhắc người quản lý chính mở app nhé. (tạm)</P>
      )}
    </Screen>
  );
}
