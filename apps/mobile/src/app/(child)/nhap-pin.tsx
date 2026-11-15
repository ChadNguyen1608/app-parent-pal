import { useState } from 'react';

import { PIN_LENGTH, checkPin } from '@/data/validate';
import { useApp } from '@/state/app';
import { Btn, Field, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// CA-12 Nhập Parent PIN để hủy kết nối. Máy chủ kiểm PIN và giới hạn số lần sai. PIN sai: không hủy.
export default function NhapPin() {
  const { api, childId, onUnlinked } = useApp();
  const [pin, setPin] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const act = useAction('pin');

  async function submit() {
    const bad = checkPin(pin);
    setFieldError(bad);
    if (bad || !childId) return;
    const ok = await act.run(() => api.unlinkDevice(childId, pin));
    if (ok) await onUnlinked(); // cổng ở _layout đưa về CA-01
    else setPin('');
  }

  return (
    <Screen big>
      <H1>Cần bố mẹ nhập PIN</H1>
      <P big>Chỉ bố mẹ hủy được kết nối. Nhờ bố mẹ nhập PIN.</P>
      <Field label={`PIN (${PIN_LENGTH} số)`} value={pin} onChangeText={(t) => { setPin(t.replace(/\D/g, '').slice(0, PIN_LENGTH)); setFieldError(null); }} keyboardType="number-pad" secureTextEntry maxLength={PIN_LENGTH} error={fieldError} />
      {act.error ? <Notice>{act.error}</Notice> : null}
      <Btn big kind="danger" label="Hủy kết nối" onPress={submit} busy={act.busy} />
    </Screen>
  );
}
