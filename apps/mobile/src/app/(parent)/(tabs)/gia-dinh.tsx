import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PLAN_RULES, childPlanLine, deviceKeysLine, pairLockRule, planLines, tierLabel } from '@/data/plan';
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

// PA-03 rút gọn: thẻ từng con + lối vào PA-06 (sức khỏe của con), PA-13 (ghép máy), PA-14 (PIN), PA-15 (báo của con), PA-32 (quyền riêng tư), Cài đặt dữ liệu (D-73), PA-33, PA-35, PA-38.
export default function GiaDinh() {
  const router = useRouter();
  const { api, home, refreshHome, plan, refreshPlan } = useApp();
  const [unseen, setUnseen] = useState(0);
  useFocusEffect(
    useCallback(() => {
      void refreshHome().catch(() => undefined);
      void refreshPlan().catch(() => undefined);
      // Số báo của con chưa xem (D-67). Lỗi đọc thì không hiện số; màn Thông báo tự báo lỗi.
      void api
        .listChildAlerts()
        .then((a) => setUnseen(a.filter((x) => x.seenAt === null).length))
        .catch(() => setUnseen(0));
    }, [api, refreshHome, refreshPlan]),
  );
  const alertsOn = (home?.children ?? []).some((c) => c.alertConsent);
  // Gói chưa biết (plan null) thì không khóa: máy chủ vẫn chặn nếu thiếu gói. Biết là chưa có gói hoặc hết khóa ghép máy thì khóa và giải thích (D-74).
  const lockRule = (c: Child): string | null => (plan === null ? null : pairLockRule(plan, c.pairState === 'PENDING'));
  return (
    <Screen>
      <H1>Gia đình</H1>
      {plan ? (
        <View style={s.card} accessibilityRole="summary">
          <Text style={s.name}>{`Gói: ${tierLabel(plan)}`}</Text>
          {planLines(plan).map((line) => (
            <P key={line} muted>
              {line}
            </P>
          ))}
          <P muted>{deviceKeysLine(plan)}</P>
          {plan.tier === 'FREE' && plan.trialAvailable ? (
            <Btn label={`Dùng thử ${plan.trialDays} ngày`} kind="secondary" onPress={() => router.push({ pathname: '/(parent)/can-goi', params: { rule: PLAN_RULES.free } })} />
          ) : null}
        </View>
      ) : null}
      {home?.children.map((c) => (
        <View key={c.id} style={s.card}>
          <Text style={s.name}>{c.callName}</Text>
          <P muted>
            {c.grade ? `Lớp ${c.grade}` : c.ageYears !== null ? `${c.ageYears} tuổi` : ''}
            {' · '}
            {pairText(c)}
          </P>
          {childPlanLine(plan, c.id) ? <P muted>{childPlanLine(plan, c.id)}</P> : null}
          <Btn label={`Sức khỏe của ${c.callName}`} kind="secondary" onPress={() => router.push({ pathname: '/(parent)/suc-khoe', params: { childId: c.id } })} />
          {c.hasDevice && c.pairState !== 'PAIRED' ? (
            lockRule(c) !== null ? (
              <Btn
                label={lockRule(c) === PLAN_RULES.keys ? 'Ghép máy của con (hết khóa)' : 'Ghép máy của con (cần gói)'}
                kind="secondary"
                onPress={() => router.push({ pathname: '/(parent)/can-goi', params: { rule: lockRule(c) ?? PLAN_RULES.premium } })}
              />
            ) : (
              <Btn label="Ghép máy của con" kind="secondary" onPress={() => router.push({ pathname: '/(parent)/ghep-may', params: { childId: c.id } })} />
            )
          ) : null}
        </View>
      ))}
      {alertsOn ? <Btn label={unseen > 0 ? `Thông báo của con (${unseen} chưa xem)` : 'Thông báo của con'} kind="secondary" onPress={() => router.push('/(parent)/thong-bao')} /> : null}
      <Btn label="Cài đặt dữ liệu" kind="secondary" onPress={() => router.push('/(parent)/cai-dat-du-lieu')} />
      <Btn label="Quyền riêng tư và điều khoản" kind="secondary" onPress={() => router.push('/(parent)/quyen-rieng-tu')} />
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
