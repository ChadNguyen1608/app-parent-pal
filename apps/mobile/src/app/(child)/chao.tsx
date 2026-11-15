import { useRouter } from 'expo-router';

import { useApp } from '@/state/app';
import { Btn, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// CA-01 Chào / chưa ghép. Lời ngắn, một ý một câu. "Lấy mã" đăng nhập ẩn danh (máy này chưa có tài khoản).
export default function Chao() {
  const router = useRouter();
  const { api, session } = useApp();
  const act = useAction();
  async function getCode() {
    const ok = await act.run(async () => {
      if (!session) await api.auth.signInAnonymously();
    });
    if (ok) router.push('/(child)/ma-ghep');
  }
  return (
    <Screen big>
      <H1>Chào con</H1>
      <P big>Máy này chưa kết nối với gia đình.</P>
      <P big>Con lấy một mã, rồi đưa mã cho bố mẹ nhé.</P>
      {act.error ? <Notice>{act.error}</Notice> : null}
      <Btn big label="Lấy mã" onPress={getCode} busy={act.busy} />
    </Screen>
  );
}
