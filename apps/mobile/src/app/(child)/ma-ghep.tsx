import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { PairCode } from '@/data/types';
import { errorMessage } from '@/data/errors';
import { useApp } from '@/state/app';
import { Btn, COLORS, H1, Notice, P, Screen } from '@/ui/kit';

const POLL_MS = 4000;

// CA-02 Mã ghép: mã cỡ lớn, dùng một lần. Chờ ghép bằng thăm dò pair_accept hoặc nút "Bố mẹ đã nhập".
export default function MaGhep() {
  const router = useRouter();
  const { api, onPaired } = useApp();
  const [code, setCode] = useState<PairCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [expired, setExpired] = useState(false);
  const [waitedNote, setWaitedNote] = useState<string | null>(null);
  const alive = useRef(true);
  const inFlight = useRef(false);

  const newCode = useCallback(async () => {
    setError(null);
    setExpired(false);
    setWaitedNote(null);
    setCode(null);
    try {
      const c = await api.pairCodeCreate();
      if (alive.current) setCode(c);
    } catch (e) {
      if (alive.current) setError(errorMessage(e));
    }
  }, [api]);

  const check = useCallback(
    async (manual: boolean) => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (manual) setChecking(true);
      try {
        const r = await api.pairAccept();
        if (!alive.current) return;
        if (r.status === 'PAIRED') onPaired(r.childId);
        else if (manual) setWaitedNote('Bố mẹ chưa nhập mã. Con chờ thêm một chút nhé.');
      } catch (e) {
        if (alive.current && manual) setError(errorMessage(e));
      } finally {
        inFlight.current = false;
        if (alive.current) setChecking(false);
      }
    },
    [api, onPaired],
  );

  useEffect(() => {
    alive.current = true;
    void newCode();
    return () => {
      alive.current = false;
    };
  }, [newCode]);

  // Thăm dò khi đã có mã.
  useEffect(() => {
    if (!code) return;
    const t = setInterval(() => {
      if (code.expiresAt && Date.parse(code.expiresAt) <= Date.now()) setExpired(true);
      else void check(false);
    }, POLL_MS);
    return () => clearInterval(t);
  }, [code, check]);

  return (
    <Screen big>
      <H1>Mã của con</H1>
      <P big>Đưa mã này cho bố mẹ nhập trong app của bố mẹ.</P>
      <View style={s.codeBox} accessibilityLabel={code ? `Mã ghép ${code.code.split('').join(' ')}` : 'Đang lấy mã'}>
        <Text style={s.code} selectable={false}>
          {code && !expired ? code.code.split('').join(' ') : '· · · · · ·'}
        </Text>
      </View>
      {expired ? <Notice>Mã hết hạn rồi. Con bấm "Lấy mã mới" nhé.</Notice> : null}
      {waitedNote ? <Notice kind="info">{waitedNote}</Notice> : null}
      {error ? <Notice>{error}</Notice> : null}
      <Btn big label="Bố mẹ đã nhập" onPress={() => void check(true)} busy={checking} disabled={!code || expired} />
      <Btn big kind="secondary" label="Lấy mã mới" onPress={() => void newCode()} />
      <Btn kind="secondary" label="Quay lại" onPress={() => router.back()} />
    </Screen>
  );
}

const s = StyleSheet.create({
  codeBox: { borderWidth: 2, borderColor: COLORS.primary, borderRadius: 16, paddingVertical: 24, alignItems: 'center', backgroundColor: COLORS.bgSoft },
  code: { fontSize: 52, fontWeight: '800', letterSpacing: 4, color: COLORS.text },
});
