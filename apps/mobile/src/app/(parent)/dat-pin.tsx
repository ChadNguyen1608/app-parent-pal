import { useRouter } from 'expo-router';
import { useState } from 'react';

import { PIN_LENGTH, checkPin } from '@/data/validate';
import { useApp } from '@/state/app';
import { Btn, Field, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// PA-14 Parent PIN: đặt hoặc đổi (pin_set, không cần PIN cũ). PIN không hiện lại. Mục đích: con không tự hủy liên kết.
// Lần ghép máy đầu tiên đặt PIN ngay trong PA-13 (pair_confirm p_pin), màn này dùng khi muốn đặt trước hoặc đổi.
export default function DatPin() {
  const router = useRouter();
  const { api } = useApp();
  const [pin, setPin] = useState('');
  const [again, setAgain] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const act = useAction();

  async function submit() {
    const bad = checkPin(pin, again);
    setFieldError(bad);
    if (bad) return;
    const ok = await act.run(() => api.pinSet(pin));
    if (ok) {
      setPin('');
      setAgain('');
      setDone(true);
    }
  }

  if (done) {
    return (
      <Screen>
        <H1>Đã lưu mã PIN</H1>
        <P>Từ nay, con muốn hủy kết nối máy thì cần bạn nhập mã này. Mình không hiện lại mã PIN, bạn nhớ giúp mình nhé.</P>
        <Btn label="Xong" onPress={() => router.replace('/(parent)/(tabs)/gia-dinh')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <H1>Mã PIN của bố mẹ</H1>
      <P>Mã PIN giúp con không tự hủy kết nối máy. Bạn đặt {PIN_LENGTH} số, không chia sẻ cho con.</P>
      <Field label={`PIN (${PIN_LENGTH} số)`} value={pin} onChangeText={(t) => { setPin(t.replace(/\D/g, '').slice(0, PIN_LENGTH)); setFieldError(null); }} keyboardType="number-pad" secureTextEntry maxLength={PIN_LENGTH} />
      <Field label="Nhập lại PIN" value={again} onChangeText={(t) => { setAgain(t.replace(/\D/g, '').slice(0, PIN_LENGTH)); setFieldError(null); }} keyboardType="number-pad" secureTextEntry maxLength={PIN_LENGTH} error={fieldError} />
      {act.error ? <Notice>{act.error}</Notice> : null}
      <Btn label="Lưu PIN" onPress={submit} busy={act.busy} />
    </Screen>
  );
}
