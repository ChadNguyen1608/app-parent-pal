import { useApp } from '@/state/app';
import { Btn, H1, P, Screen } from '@/ui/kit';
import { deletionLine } from '@/ui/deletion-status';

// Sau khi gửi yêu cầu xóa gia đình: hộ đang chờ xóa, không còn gì để dùng. Chỉ cho xem trạng thái và đăng xuất.
export default function DangXoa() {
  const { home, signOut } = useApp();
  return (
    <Screen>
      <H1>Đã nhận yêu cầu xóa</H1>
      {(home?.openDeletions ?? []).map((d) => (
        <P key={d.id}>{deletionLine(d)}</P>
      ))}
      <Btn label="Đăng xuất" kind="secondary" onPress={() => void signOut()} />
    </Screen>
  );
}
