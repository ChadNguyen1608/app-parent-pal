import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { activeDependents, effectiveCodes, PURPOSE_CONBAO, PURPOSE_LICH } from '@/data/consent';
import { errorMessage } from '@/data/errors';
import type { ConsentOverview } from '@/data/types';
import { useApp } from '@/state/app';
import { Btn, Choice, H1, Note, Notice, P, Screen, SwitchRow } from '@/ui/kit';
import { PURPOSE_LABELS, shortName } from '@/ui/purpose-labels';
import { useAction } from '@/ui/useAction';

// PA-32 Quyền riêng tư và đồng ý. Công tắc từng mục: tắt = rút đồng ý mục đó, bật = đồng ý lại.
// Tắt mục cha kéo theo mục con đang bật: hỏi ngay trong màn trước khi rút (câu hỏi "tạm", chờ duyệt).
// MD-CONBAO hiện "đang chờ duyệt", không bật được. Mục lõi (lịch) chỉ rút bằng "Rút toàn bộ đồng ý".
export default function QuyenRieng() {
  const router = useRouter();
  const { api, home } = useApp();
  const kids = home?.children ?? [];
  const [childId, setChildId] = useState<string | null>(kids[0]?.id ?? null);
  const [overview, setOverview] = useState<ConsentOverview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmOff, setConfirmOff] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
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
  const effective = overview ? new Set(effectiveCodes(overview)) : new Set<string>();
  const isOn = (code: string) => overview?.states[code]?.state === 'DANG_BAT';

  async function set(code: string, event: 'DONG_Y' | 'RUT') {
    setConfirmOff(null);
    setDone(null);
    await act.run(async () => {
      const r = await api.consentRecord({ childId: cid!, purposeCode: code, event });
      if (r.alsoWithdrawn.length > 0) setDone(`Đã tắt thêm: ${r.alsoWithdrawn.map(shortName).join(', ')}. (tạm)`);
      await load();
    });
  }

  function onSwitch(code: string, next: boolean) {
    if (!overview) return;
    if (next) return void set(code, 'DONG_Y');
    if (activeDependents(overview, code).length > 0) setConfirmOff(code);
    else void set(code, 'RUT');
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
      <P muted>Tắt một mục là rút đồng ý cho mục đó: tính năng tắt, dữ liệu cũ của mục đó được ẩn ngay và không tự hiện lại khi bật lại.</P>
      {loadError ? <Notice>{loadError}</Notice> : null}
      <View>
        {PURPOSE_LABELS.map((l) => {
          const info = overview?.purposes.find((p) => p.code === l.code);
          const required = l.code === PURPOSE_LICH;
          const pending = l.code === PURPOSE_CONBAO || (info ? !info.collectEnabled : false);
          const parentOff = info?.dependsOn.find((d) => !isOn(d));
          const desc = pending
            ? 'Đang chờ duyệt'
            : required
              ? 'Bắt buộc'
              : isOn(l.code)
                ? effective.has(l.code)
                  ? 'Bật'
                  : 'Bật, nhưng chưa dùng được vì mục cha đang tắt. (tạm)'
                : 'Tắt';
          return (
            <SwitchRow
              key={l.code}
              label={l.short}
              desc={desc}
              value={required || (isOn(l.code) && !pending)}
              disabled={!overview || required || pending || !isPrimary || act.busy || (!isOn(l.code) && parentOff !== undefined)}
              onValueChange={(v) => onSwitch(l.code, v)}
            />
          );
        })}
      </View>
      {confirmOff && overview ? (
        <Notice kind="info">
          {`Tắt "${shortName(confirmOff)}" cũng tắt: ${activeDependents(overview, confirmOff).map(shortName).join(', ')}. Bạn tắt chứ? (tạm)`}
        </Notice>
      ) : null}
      {confirmOff ? (
        <View style={{ gap: 8 }}>
          <Btn label="Tắt" kind="danger" onPress={() => void set(confirmOff, 'RUT')} busy={act.busy} />
          <Btn label="Giữ nguyên" kind="secondary" onPress={() => setConfirmOff(null)} />
        </View>
      ) : null}
      {done ? <Notice kind="info">{done}</Notice> : null}
      {act.error ? <Notice>{act.error}</Notice> : null}
      {!isPrimary ? <Note>Chỉ người quản lý chính đổi được các mục này. (tạm)</Note> : null}
      <Note>Đã ghi đồng ý không có nghĩa là đã đủ căn cứ pháp lý. Bản chính sách hiện là bản nháp, chưa duyệt.</Note>
      {isPrimary ? <Btn label="Rút toàn bộ đồng ý" kind="secondary" onPress={() => router.push({ pathname: '/(parent)/xoa', params: { scope: 'RUT', childId: cid } })} /> : null}
    </Screen>
  );
}
