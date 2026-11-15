import { useApp } from '@/state/app';
import { Btn, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// PA-38 rút gọn: phiên của chính mình. (Danh sách nhiều phiên cần backend, task sau.)
export default function Phien() {
  const { session, signOut } = useApp();
  const act = useAction();
  return (
    <Screen>
      <H1>Phiên đăng nhập</H1>
      <P>Bạn đang đăng nhập trên máy này{session?.email ? ` bằng ${session.email}` : ''}.</P>
      <P muted>Đăng xuất máy này không hủy kết nối máy của con.</P>
      {act.error ? <Notice>{act.error}</Notice> : null}
      <Btn label="Đăng xuất máy này" kind="danger" onPress={() => void act.run(signOut)} busy={act.busy} />
    </Screen>
  );
}
