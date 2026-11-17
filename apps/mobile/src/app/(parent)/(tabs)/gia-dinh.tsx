import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Child } from '@/data/types';
import { useApp } from '@/state/app';
import { Btn, H1, P, Screen } from '@/ui/kit';
import { LabLink } from '@/ui/LabLink';

function pairText(c: Child): string {
  if (!c.hasDevice) return 'Chưa có máy riêng';
  if (c.pairState === 'PAIRED') return 'Đã ghép máy';
  if (c.pairState === 'PENDING') return 'Đang chờ máy của con xác nhận';
  return 'Chưa ghép máy';
}

// PA-03 rút gọn: thẻ từng con + lối vào PA-06 (sức khỏe của con), PA-13 (ghép máy), PA-14 (PIN), PA-15 (báo của con), PA-32, PA-33, PA-35, PA-38.
export default function GiaDinh() {
  const router = useRouter();
  const { api, home, refreshHome } = useApp();
  const [unseen, setUnseen] = useState(0);
  useFocusEffect(
    useCallback(() => {
      void refreshHome().catch(() => undefined);
      // Số báo của con chưa xem (D-67). Lỗi đọc thì không hiện số; màn Thông báo tự báo lỗi.
      void api
        .listChildAlerts()
        .then((a) => setUnseen(a.filter((x) => x.seenAt === null).length))
        .catch(() => setUnseen(0));
    }, [api, refreshHome]),
  );
  const alertsOn = (home?.children ?? []).some((c) => c.alertConsent);
  return (
    <Screen>
      <H1>Gia đình</H1>
      {home?.children.map((c) => (
        <View key={c.id} style={s.card}>
          <Text style={s.name}>{c.callName}</Text>
          <P muted>
            {c.grade ? `Lớp ${c.grade}` : c.ageYears !== null ? `${c.ageYears} tuổi` : ''}
            {' · '}
            {pairText(c)}
          </P>
          <Btn label={`Sức khỏe của ${c.callName}`} kind="secondary" onPress={() => router.push({ pathname: '/(parent)/suc-khoe', params: { childId: c.id } })} />
          {c.hasDevice && c.pairState !== 'PAIRED' ? (
            <Btn label="Ghép máy của con" kind="secondary" onPress={() => router.push({ pathname: '/(parent)/ghep-may', params: { childId: c.id } })} />
          ) : null}
        </View>
      ))}
      {alertsOn ? <Btn label={unseen > 0 ? `Thông báo của con (${unseen} chưa xem)` : 'Thông báo của con'} kind="secondary" onPress={() => router.push('/(parent)/thong-bao')} /> : null}
      <Btn label="Quyền riêng tư và đồng ý" kind="secondary" onPress={() => router.push('/(parent)/quyen-rieng-tu')} />
      <Btn label="Dữ liệu của gia đình" kind="secondary" onPress={() => router.push('/(parent)/du-lieu')} />
      <Btn label="Xóa tài khoản và dữ liệu" kind="secondary" onPress={() => router.push('/(parent)/xoa')} />
      <Btn label="Đặt hoặc đổi mã PIN" kind="secondary" onPress={() => router.push('/(parent)/dat-pin')} />
      <Btn label="Phiên đăng nhập" kind="secondary" onPress={() => router.push('/(parent)/phien')} />
      <LabLink />
    </Screen>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#C9CED6', borderRadius: 12, padding: 14, gap: 8 },
  name: { fontSize: 20, fontWeight: '700' },
});
