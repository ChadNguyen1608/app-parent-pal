import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { PAIR_CODE_LENGTH, checkPairCode } from '@/data/validate';
import { useApp } from '@/state/app';
import { Btn, Choice, Field, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// PA-13 Ghép máy của con: chọn con, nhập mã hiện trên máy con. Mã sai hoặc hết hạn: một câu chung (AC-FAM-11).
export default function GhepMay() {
  const router = useRouter();
  const { childId: paramId } = useLocalSearchParams<{ childId?: string }>();
  const { api, home, refreshHome } = useApp();
  const options = (home?.children ?? []).filter((c) => c.hasDevice && c.pairState !== 'PAIRED');
  const [childId, setChildId] = useState<string | null>(paramId ?? (options.length === 1 ? options[0].id : null));
  const [code, setCode] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const act = useAction('pair');

  async function submit() {
    const bad = !childId ? 'Bạn chọn con cần ghép máy nhé.' : checkPairCode(code);
    setFieldError(bad);
    if (bad || !childId) return;
    const ok = await act.run(async () => {
      await api.pairConfirm(childId, code);
      await refreshHome().catch(() => undefined);
    });
    if (ok) router.replace({ pathname: '/(parent)/dat-pin', params: { childId, afterPair: '1' } });
  }

  if (options.length === 0) {
    return (
      <Screen>
        <H1>Ghép máy của con</H1>
        <P>Chưa có con nào cần ghép máy. Chỉ ghép được khi hồ sơ con ghi "có điện thoại riêng".</P>
        <Btn label="Quay lại" kind="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <H1>Ghép máy của con</H1>
      <P>Mở app Parent-Pal Con trên máy của con để lấy mã, rồi nhập mã vào đây.</P>
      <View style={{ gap: 8 }}>
        {options.map((c) => (
          <Choice key={c.id} label={c.callName} selected={childId === c.id} onPress={() => setChildId(c.id)} />
        ))}
      </View>
      <Field
        label={`Mã trên máy con (${PAIR_CODE_LENGTH} số)`}
        value={code}
        onChangeText={(t) => {
          setCode(t.replace(/\D/g, '').slice(0, PAIR_CODE_LENGTH));
          setFieldError(null);
        }}
        keyboardType="number-pad"
        maxLength={PAIR_CODE_LENGTH}
        error={fieldError}
      />
      {act.error ? <Notice>{act.error}</Notice> : null}
      <Btn label="Ghép máy" onPress={submit} busy={act.busy} />
    </Screen>
  );
}
