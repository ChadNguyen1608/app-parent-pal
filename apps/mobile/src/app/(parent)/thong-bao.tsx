import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { errorMessage } from '@/data/errors';
import type { ChildAlert } from '@/data/types';
import { useApp } from '@/state/app';
import { PARENT_LINE } from '@/ui/alert-text';
import { Btn, H1, Note, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// PA-15 Thông báo (phần "con báo bố mẹ ngay", D-58, D-67): danh sách báo của con trong 7 ngày, đánh dấu đã xem.
// Máy chủ tự xóa sau 7 ngày và không đưa vào báo cáo tuần. Chỉ hiện khi bố mẹ đã bật MD-CONBAO cho con đó.
// Thông báo đẩy làm sau (T3.5): bố mẹ thấy báo khi mở app. Wireframe PA-15 chưa vẽ phần này: câu chữ "tạm".
function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function ThongBao() {
  const { api, home } = useApp();
  const [alerts, setAlerts] = useState<ChildAlert[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const act = useAction();
  const nameOf = (id: string) => home?.children.find((c) => c.id === id)?.callName ?? null;

  const load = useCallback(async () => {
    try {
      setAlerts(await api.listChildAlerts());
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e));
    }
  }, [api]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function seen(a: ChildAlert) {
    await act.run(async () => {
      await api.childAlertSeen(a.id);
      await load();
    });
  }

  const shown = (alerts ?? []).filter((a) => nameOf(a.childId) !== null);
  return (
    <Screen>
      <H1>Thông báo của con</H1>
      <Note>Con báo bằng câu có sẵn, không có chữ tự gõ. Thông báo tự xóa sau 7 ngày và không vào báo cáo tuần. Bạn thấy báo khi mở app (chưa có thông báo đẩy). (tạm)</Note>
      {loadError ? <Notice>{loadError}</Notice> : null}
      {act.error ? <Notice>{act.error}</Notice> : null}
      {alerts !== null && shown.length === 0 && !loadError ? <P muted>Chưa có báo nào trong 7 ngày qua. Nếu bạn chưa bật "Con báo bố mẹ ngay" thì con chưa gửi được.</P> : null}
      {shown.map((a) => (
        <View key={a.id} style={{ borderWidth: 1, borderColor: '#C9CED6', borderRadius: 12, padding: 14, gap: 6, backgroundColor: a.seenAt ? '#fff' : '#FDF3E7' }} accessible={false}>
          <Text style={{ fontSize: 17, fontWeight: '700' }}>
            {nameOf(a.childId)}: {PARENT_LINE[a.kind]}
          </Text>
          <P muted>
            {formatWhen(a.createdAt)} · {a.seenAt ? 'Đã xem' : 'Chưa xem'}
          </P>
          {a.seenAt ? null : <Btn label="Đánh dấu đã xem" kind="secondary" onPress={() => void seen(a)} disabled={act.busy} />}
        </View>
      ))}
    </Screen>
  );
}
