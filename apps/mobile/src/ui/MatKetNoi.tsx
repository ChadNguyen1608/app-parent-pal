import { Btn, H1, P, Screen } from '@/ui/kit';

// CA-17 Máy không còn kết nối với gia đình. Câu chữ nguyên từ wireframe ("Chào con", câu thông báo, "Lấy mã mới").
export function MatKetNoi({ onNewCode, busy }: { onNewCode: () => void; busy?: boolean }) {
  return (
    <Screen big>
      <H1>Chào con</H1>
      <P big>Máy này không còn kết nối với gia đình.</P>
      <Btn big kind="secondary" label="Lấy mã mới" onPress={onNewCode} busy={busy} />
    </Screen>
  );
}
