import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { PairCode } from '@/data/types';
import { errorMessage } from '@/data/errors';
import { useApp } from '@/state/app';
import { Btn, COLORS, H1, Notice, P, Screen } from '@/ui/kit';

const POLL_MS = 4000;

type Asking = { adultCallName: string };

// CA-02 Mã ghép: mã cỡ lớn, dùng một lần. Máy con hỏi máy chủ (pair_pending) xem bố mẹ đã nhập mã chưa.
// Khi có yêu cầu: "Kết nối với [tên]? Đồng ý / Không" (AD-11). Đồng ý -> pair_accept (lưu binding_epoch); Không -> pair_decline.
export default function MaGhep() {
  const router = useRouter();
  const { api, onPaired } = useApp();
  const [code, setCode] = useState<PairCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [expired, setExpired] = useState(false);
  const [asking, setAsking] = useState<Asking | null>(null);
  const [answering, setAnswering] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const alive = useRef(true);
  const inFlight = useRef(false);
  const askingRef = useRef<Asking | null>(null);
  askingRef.current = asking;

  const newCode = useCallback(async () => {
    setError(null);
    setExpired(false);
    setAsking(null);
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
      if (manual) {
        setChecking(true);
        setNote(null);
      }
      try {
        const r = await api.pairPending();
        if (!alive.current) return;
        if (r.pending) {
          setAsking({ adultCallName: r.adultCallName });
        } else if (askingRef.current) {
          // Yêu cầu đang hỏi đã biến mất (hết hạn hoặc bố mẹ thay yêu cầu): lấy mã mới.
          setNote('Yêu cầu kết nối đã hết hạn. Con lấy mã mới nhé.');
          void newCode();
        } else if (manual) {
          setNote('Bố mẹ chưa nhập mã. Con chờ thêm một chút nhé.');
        }
      } catch (e) {
        if (alive.current && manual) setError(errorMessage(e));
      } finally {
        inFlight.current = false;
        if (alive.current) setChecking(false);
      }
    },
    [api, newCode],
  );

  async function accept() {
    if (answering) return;
    setAnswering(true);
    setError(null);
    try {
      onPaired(await api.pairAccept());
    } catch (e) {
      if (!alive.current) return;
      // Quá hạn (ok=false, NOT_FOUND) hoặc yêu cầu không còn: báo rồi lấy mã mới.
      setError(errorMessage(e));
      void newCode();
    } finally {
      if (alive.current) setAnswering(false);
    }
  }

  async function decline() {
    if (answering) return;
    setAnswering(true);
    setError(null);
    try {
      await api.pairDecline();
      if (alive.current) {
        setNote('Con đã chọn không kết nối. Cần ghép lại thì lấy mã mới nhé.');
        void newCode();
      }
    } catch (e) {
      if (alive.current) setError(errorMessage(e));
    } finally {
      if (alive.current) setAnswering(false);
    }
  }

  useEffect(() => {
    alive.current = true;
    void newCode();
    return () => {
      alive.current = false;
    };
  }, [newCode]);

  // Thăm dò khi đã có mã (kể cả khi đang hỏi, để biết yêu cầu hết hạn).
  useEffect(() => {
    if (!code) return;
    const t = setInterval(() => {
      if (!askingRef.current && code.expiresAt && Date.parse(code.expiresAt) <= Date.now()) setExpired(true);
      else void check(false);
    }, POLL_MS);
    return () => clearInterval(t);
  }, [code, check]);

  if (asking) {
    return (
      <Screen big>
        <H1>{`Kết nối với ${asking.adultCallName}?`}</H1>
        <P big>{`${asking.adultCallName} vừa nhập mã của con. Con đồng ý thì máy này sẽ kết nối với gia đình.`}</P>
        {error ? <Notice>{error}</Notice> : null}
        <Btn big label="Đồng ý" onPress={() => void accept()} busy={answering} />
        <Btn big kind="secondary" label="Không" onPress={() => void decline()} disabled={answering} />
      </Screen>
    );
  }

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
      {note ? <Notice kind="info">{note}</Notice> : null}
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
