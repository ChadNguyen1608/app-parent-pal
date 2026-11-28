import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import type { ApiError } from '@/data/errors';
import { PLAN_RULES, pairLockRule } from '@/data/plan';
import type { PairConfirmResult } from '@/data/types';
import { PAIR_CODE_LENGTH, PIN_EXISTS_HINT, PIN_LENGTH, PIN_REQUIRED_HINT, PIN_REQUIRED_RULE, checkPairCode, checkPin } from '@/data/validate';
import { useApp } from '@/state/app';
import { Btn, Choice, Field, H1, Notice, P, Screen } from '@/ui/kit';
import { PlanRequiredView } from '@/ui/PlanRequired';
import { useAction } from '@/ui/useAction';

const isPinRequired = (e: ApiError | null) => e?.code === 'VALIDATION' && e.rule === PIN_REQUIRED_RULE && e.userMessage.startsWith(PIN_REQUIRED_HINT);
const isPinExists = (e: ApiError | null) => e?.code === 'VALIDATION' && e.rule === PIN_REQUIRED_RULE && e.userMessage.startsWith(PIN_EXISTS_HINT);

// PA-13 Ghép máy của con: chọn con, nhập mã hiện trên máy con.
// Lần ghép đầu của người quản lý phải kèm PIN (pair_confirm p_pin). App chưa biết đã có PIN hay chưa, nên gửi không PIN trước;
// máy chủ báo "Cần đặt Parent PIN" (kiểm trước khi tính mã, không tốn lần thử) thì hiện ô đặt PIN rồi gửi lại cùng mã.
// Mã sai hoặc hết hạn: một câu chung (AC-FAM-11), máy chủ tự đếm và khóa.
export default function GhepMay() {
  const router = useRouter();
  const { childId: paramId } = useLocalSearchParams<{ childId?: string }>();
  const { api, home, refreshHome, plan } = useApp();
  const options = (home?.children ?? []).filter((c) => c.hasDevice && c.pairState !== 'PAIRED');
  const [childId, setChildId] = useState<string | null>(paramId ?? (options.length === 1 ? options[0].id : null));
  const [code, setCode] = useState('');
  const [needPin, setNeedPin] = useState(false);
  const [pin, setPin] = useState('');
  const [again, setAgain] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [result, setResult] = useState<PairConfirmResult | null>(null);
  const act = useAction();

  async function submit() {
    const bad = !childId ? 'Bạn chọn con cần ghép máy nhé.' : checkPairCode(code);
    setFieldError(bad);
    const badPin = needPin ? checkPin(pin, again) : null;
    setPinError(badPin);
    if (bad || badPin || !childId) return;
    let r: PairConfirmResult | null = null;
    const ok = await act.run(async () => {
      r = await api.pairConfirm(childId, code, needPin ? pin : undefined);
      await refreshHome().catch(() => undefined);
    });
    if (ok && r) {
      setPin('');
      setAgain('');
      setResult(r);
    }
  }

  // Sau khi báo lỗi: hiện hoặc ẩn ô PIN theo lời máy chủ (không đoán).
  const failure = act.failure;
  useEffect(() => {
    if (isPinRequired(failure)) setNeedPin(true);
    else if (isPinExists(failure)) {
      setNeedPin(false);
      setPin('');
      setAgain('');
    }
  }, [failure]);

  // D-74: ghép máy theo khóa. App biết chưa có gói hoặc hết khóa, hoặc máy chủ vừa báo PLAN_REQUIRED / DEVICE_KEY_LIMIT, thì giải thích thay vì cho nhập mã.
  const pending = (home?.children ?? []).find((c) => c.id === childId)?.pairState === 'PENDING';
  const lock = plan ? pairLockRule(plan, pending) : null;
  const serverBlock = failure?.code === 'PLAN_REQUIRED' || failure?.code === 'DEVICE_KEY_LIMIT';
  if (lock !== null || serverBlock) {
    return <PlanRequiredView rule={serverBlock ? failure?.rule : (lock ?? PLAN_RULES.premium)} onBack={() => router.back()} />;
  }

  if (result) {
    return (
      <Screen>
        <H1>Đã nhập mã đúng</H1>
        {result.state === 'CHO_XAC_NHAN_MAY_CON' ? (
          <>
            <P>Máy của con sẽ hỏi "Kết nối với bạn?". Con chạm "Đồng ý" trên máy là xong. Nếu con chạm "Không" thì chưa kết nối.</P>
            {result.pinSet ? <P>Mã PIN của bố mẹ đã được lưu. Mình không hiện lại mã PIN, bạn nhớ giúp mình nhé.</P> : null}
          </>
        ) : (
          <Notice kind="info">Máy này từng ghép với gia đình khác nên cần xác minh thêm, chưa kết nối ngay. Mình chưa cho máy này xem gì cho tới khi xác minh xong.</Notice>
        )}
        <Btn label="Xong" onPress={() => router.replace('/(parent)/(tabs)/gia-dinh')} />
      </Screen>
    );
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
      {needPin ? (
        <>
          <Notice kind="info">Đây là lần ghép đầu của bạn, nên cần đặt mã PIN. PIN giúp con không tự hủy kết nối máy, bạn không chia sẻ cho con.</Notice>
          <Field label={`Đặt PIN (${PIN_LENGTH} số)`} value={pin} onChangeText={(t) => { setPin(t.replace(/\D/g, '').slice(0, PIN_LENGTH)); setPinError(null); }} keyboardType="number-pad" secureTextEntry maxLength={PIN_LENGTH} />
          <Field label="Nhập lại PIN" value={again} onChangeText={(t) => { setAgain(t.replace(/\D/g, '').slice(0, PIN_LENGTH)); setPinError(null); }} keyboardType="number-pad" secureTextEntry maxLength={PIN_LENGTH} error={pinError} />
        </>
      ) : null}
      {act.error && !isPinRequired(failure) ? <Notice>{act.error}</Notice> : null}
      <Btn label="Ghép máy" onPress={submit} busy={act.busy} />
    </Screen>
  );
}
