import { useState } from 'react';

import { PIN_LENGTH, checkPin } from '@/data/validate';
import { useApp } from '@/state/app';
import { Btn, Field, H1, Notice, P, Screen } from '@/ui/kit';
import { useAction } from '@/ui/useAction';

// CA-12 Nhập Parent PIN để hủy kết nối. Máy chủ kiểm PIN, đếm lần sai và khóa; lời hiện ngay trong màn (không popup):
// "còn N lần thử" hoặc "tạm khóa, thử lại sau X phút". Máy con gửi kèm binding_epoch; epoch cũ (CONFLICT_REV) thì đọc lại liên kết.
export default function NhapPin() {
  const { api, childId, bindingEpoch, onUnlinked, refreshBinding } = useApp();
  const [pin, setPin] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [reloaded, setReloaded] = useState<string | null>(null);
  const act = useAction();

  async function submit() {
    const bad = checkPin(pin);
    setFieldError(bad);
    setReloaded(null);
    if (bad || !childId) return;
    if (bindingEpoch === null) {
      // Chưa biết epoch (hiếm): đọc lại liên kết trước, không gửi thiếu epoch.
      const ok = await act.run(async () => {
        if (!(await refreshBinding())) return;
        setReloaded('Mình vừa tải lại thông tin kết nối. Con nhập PIN lại nhé.');
      });
      if (!ok) setPin('');
      return;
    }
    const ok = await act.run(() => api.unlinkDevice(childId, pin, bindingEpoch));
    if (ok) {
      await onUnlinked(); // cổng ở _layout đưa về CA-01
      return;
    }
    setPin('');
  }

  // CONFLICT_REV: liên kết đã đổi. Đọc lại; nếu không còn liên kết thì app tự về màn chưa ghép.
  async function reload() {
    await act.run(async () => {
      const still = await refreshBinding();
      if (still) setReloaded('Mình đã tải lại thông tin kết nối. Con nhập PIN lại nhé.');
    });
  }

  const conflict = act.failure?.code === 'CONFLICT_REV';

  return (
    <Screen big>
      <H1>Cần bố mẹ nhập PIN</H1>
      <P big>Chỉ bố mẹ hủy được kết nối. Nhờ bố mẹ nhập PIN.</P>
      <Field label={`PIN (${PIN_LENGTH} số)`} value={pin} onChangeText={(t) => { setPin(t.replace(/\D/g, '').slice(0, PIN_LENGTH)); setFieldError(null); }} keyboardType="number-pad" secureTextEntry maxLength={PIN_LENGTH} error={fieldError} />
      {act.error ? <Notice>{act.error}</Notice> : null}
      {reloaded ? <Notice kind="info">{reloaded}</Notice> : null}
      {conflict ? <Btn big kind="secondary" label="Tải lại thông tin kết nối" onPress={() => void reload()} busy={act.busy} /> : null}
      <Btn big kind="danger" label="Hủy kết nối" onPress={submit} busy={act.busy} />
    </Screen>
  );
}
