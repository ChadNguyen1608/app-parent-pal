import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PLAN_RULES, canPair, childPlanLine, planLines, tierLabel } from '@/data/plan';
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

// PA-03 rút gọn: thẻ từng con + lối vào PA-13 (ghép máy), PA-14 (PIN), PA-38 (phiên đăng nhập).
export default function GiaDinh() {
  const router = useRouter();
  const { home, refreshHome, plan, refreshPlan } = useApp();
  useFocusEffect(
    useCallback(() => {
      void refreshHome().catch(() => undefined);
      void refreshPlan().catch(() => undefined);
    }, [refreshHome, refreshPlan]),
  );
  // Gói chưa biết (plan null) thì không khóa: máy chủ vẫn chặn nếu thiếu gói. Biết là chưa PREMIUM thì khóa và giải thích.
  const pairLocked = plan !== null && !canPair(plan);
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
          {c.hasDevice && c.pairState !== 'PAIRED' ? (
            pairLocked ? (
              <Btn label="Ghép máy của con (cần Premium)" kind="secondary" onPress={() => router.push({ pathname: '/(parent)/can-goi', params: { rule: PLAN_RULES.premium } })} />
            ) : (
              <Btn label="Ghép máy của con" kind="secondary" onPress={() => router.push({ pathname: '/(parent)/ghep-may', params: { childId: c.id } })} />
            )
          ) : null}
        </View>
      ))}
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
