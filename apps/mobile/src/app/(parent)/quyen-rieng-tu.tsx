import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { OPTIONAL_PURPOSES, effectiveCodes } from '@/data/consent';
import { errorMessage } from '@/data/errors';
import type { ConsentOverview } from '@/data/types';
import { useApp } from '@/state/app';
import { Btn, Choice, H1, Note, Notice, P, Screen, SwitchRow } from '@/ui/kit';
import { CORE_LABEL, OPTIONAL_LABELS, shortName } from '@/ui/purpose-labels';
import { useAction } from '@/ui/useAction';

// PA-32 Quyền riêng tư và đồng ý (D-64). Một đồng ý cốt lõi (chỉ rút bằng "Rút toàn bộ") và hai đồng ý riêng có công tắc:
// tắt = rút đồng ý mục đó, bật = đồng ý lại. Tắt mục sức khỏe hoặc báo bố mẹ thì dữ liệu cũ của mục đó bị ẩn ngay và không hiện lại.
// "Rút toàn bộ" cho một con (consent_withdraw_all hai bước) hoặc cho cả gia đình (deletion_request GIA_DINH, hai bước ở PA-35/36).
// Wireframe PA-32 chưa vẽ theo mô hình mới: mọi câu chữ "tạm", chờ chủ sản phẩm duyệt.
export default function QuyenRieng() {
  const router = useRouter();
  const { api, home } = useApp();
  const kids = home?.children ?? [];
  const [childId, setChildId] = useState<string | null>(kids[0]?.id ?? null);
  const [overview, setOverview] = useState<ConsentOverview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmOff, setConfirmOff] = useState<string | null>(null);
  const act = useAction();
  const cid = childId ?? kids[0]?.id ?? null;
  const isPrimary = home?.role === 'PRIMARY';

  const load = useCallback(async () => {
    if (!cid) return;
    try {
      setOverview(await api.getConsentOverview(cid));
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e));
    }
  }, [api, cid]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!cid || kids.length === 0) return null;
  const childName = kids.find((c) => c.id === cid)?.callName ?? 'con';
  const effective = overview ? new Set(effectiveCodes(overview)) : new Set<string>();
  const isOn = (code: string) => overview?.states[code]?.state === 'DANG_BAT';

  async function set(code: string, event: 'DONG_Y' | 'RUT') {
    setConfirmOff(null);
    await act.run(async () => {
      await api.consentRecord({ childId: cid!, purposeCode: code, event });
      await load();
    });
  }

  return (
    <Screen>
      <H1>Quyền riêng tư và đồng ý</H1>
      {kids.length > 1 ? (
        <View style={{ gap: 8 }}>
          {kids.map((c) => (
            <Choice key={c.id} label={c.callName} selected={cid === c.id} onPress={() => { setChildId(c.id); setOverview(null); setConfirmOff(null); }} />
          ))}
        </View>
      ) : (
        <P muted>Hồ sơ của {kids[0].callName}</P>
      )}
      {loadError ? <Notice>{loadError}</Notice> : null}
      <View>
        <SwitchRow label={CORE_LABEL.short} desc={isPrimary ? 'Đang bật. Muốn rút thì dùng "Rút toàn bộ" bên dưới. (tạm)' : 'Đang bật.'} value={isOn(CORE_LABEL.code)} disabled onValueChange={() => undefined} />
        {OPTIONAL_LABELS.map((l) => {
          const info = overview?.purposes.find((p) => p.code === l.code);
          const off = info ? !info.collectEnabled : false;
          const on = isOn(l.code);
          const desc = off ? 'Chưa mở ở bản thử' : on ? (effective.has(l.code) ? 'Bật' : 'Bật, nhưng chưa dùng được. (tạm)') : 'Tắt';
          return (
            <SwitchRow
              key={l.code}
              label={l.short}
              desc={desc}
              value={on && !off}
              disabled={!overview || off || !isPrimary || act.busy}
              onValueChange={(v) => (v ? void set(l.code, 'DONG_Y') : setConfirmOff(l.code))}
            />
          );
        })}
      </View>
      {confirmOff && OPTIONAL_PURPOSES.includes(confirmOff) ? (
        <View style={{ gap: 8 }}>
          <Notice kind="info">
            {`Tắt "${shortName(confirmOff)}": dữ liệu cũ của mục này được ẩn ngay, sẽ không hiện lại khi bạn bật lại, và được xếp hàng xóa. Bạn tắt chứ? (tạm)`}
          </Notice>
          <Btn label="Tắt" kind="danger" onPress={() => void set(confirmOff, 'RUT')} busy={act.busy} />
          <Btn label="Giữ nguyên" kind="secondary" onPress={() => setConfirmOff(null)} />
        </View>
      ) : null}
      {act.error ? <Notice>{act.error}</Notice> : null}
      {!isPrimary ? <Note>Chỉ người quản lý chính đổi được các mục này. (tạm)</Note> : null}
      <Note>Đã ghi đồng ý không có nghĩa là đã đủ căn cứ pháp lý. Bản chính sách hiện là bản nháp, chưa duyệt.</Note>
      {isPrimary ? (
        <View style={{ gap: 8 }}>
          <Btn label={`Rút toàn bộ đồng ý cho ${childName}`} kind="secondary" onPress={() => router.push({ pathname: '/(parent)/xoa', params: { scope: 'RUT', childId: cid } })} />
          <Btn label="Rút toàn bộ đồng ý cho cả gia đình" kind="secondary" onPress={() => router.push({ pathname: '/(parent)/xoa', params: { scope: 'GIA_DINH' } })} />
        </View>
      ) : null}
    </Screen>
  );
}
